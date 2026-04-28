create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  created_at timestamptz not null default now(),
  unique (class_id, user_id)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  number integer not null,
  title text not null,
  description text,
  order_index integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, number)
);

create table public.subquestions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  letter text not null,
  prompt text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (topic_id, letter)
);

create table public.study_sections (
  id uuid primary key default gen_random_uuid(),
  subquestion_id uuid not null references public.subquestions(id) on delete cascade,
  title text,
  content text,
  list_items jsonb not null default '[]'::jsonb,
  mnemonic text,
  order_index integer not null default 0
);

create table public.section_tables (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.study_sections(id) on delete cascade,
  columns jsonb not null default '[]'::jsonb,
  rows jsonb not null default '[]'::jsonb,
  order_index integer not null default 0
);

create table public.section_images (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.study_sections(id) on delete cascade,
  src text not null,
  caption text,
  order_index integer not null default 0
);

create table public.exam_checklist_items (
  id uuid primary key default gen_random_uuid(),
  subquestion_id uuid not null references public.subquestions(id) on delete cascade,
  text text not null,
  order_index integer not null default 0
);

create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  subquestion_id uuid not null references public.subquestions(id) on delete cascade,
  question text not null,
  answer text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  subquestion_id uuid not null references public.subquestions(id) on delete cascade,
  question text not null,
  explanation text,
  correct_option_index integer not null default 0,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  quiz_question_id uuid not null references public.quiz_questions(id) on delete cascade,
  text text not null,
  option_index integer not null default 0
);

create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subquestion_id uuid references public.subquestions(id) on delete cascade,
  progress_key text,
  checklist_done jsonb not null default '[]'::jsonb,
  flashcards_done jsonb not null default '[]'::jsonb,
  quiz_results jsonb not null default '[]'::jsonb,
  notes text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, subquestion_id),
  unique (user_id, progress_key),
  check (subquestion_id is not null or progress_key is not null)
);

create table public.content_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.current_user_has_permission(permission_key text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_members cm
    join public.role_permissions rp on rp.role_id = cm.role_id
    join public.permissions p on p.id = rp.permission_id
    where cm.user_id = auth.uid()
      and p.key = permission_key
  );
$$;

create or replace function public.replace_topic_from_payload(subject_slug text, topic_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subject_id uuid;
  v_topic_id uuid;
  v_subquestion_id uuid;
  v_section_id uuid;
  v_quiz_question_id uuid;
  v_topic_number integer;
  v_topic_title text;
  sub_item record;
  section_item record;
  table_item record;
  image_item record;
  checklist_item record;
  flashcard_item record;
  quiz_item record;
  option_item record;
  table_payload jsonb;
begin
  if not public.current_user_has_permission('content.edit') then
    raise exception 'Missing content.edit permission';
  end if;

  v_topic_number := coalesce((topic_payload->>'id')::integer, (topic_payload->>'number')::integer);
  v_topic_title := coalesce(topic_payload->>'nazev', topic_payload->>'title');

  if v_topic_number is null or v_topic_title is null then
    raise exception 'Topic payload must include id/number and nazev/title';
  end if;

  select id into v_subject_id
  from public.subjects
  where slug = subject_slug;

  if v_subject_id is null then
    raise exception 'Unknown subject slug: %', subject_slug;
  end if;

  insert into public.topics (subject_id, number, title, order_index, published)
  values (v_subject_id, v_topic_number, v_topic_title, v_topic_number, true)
  on conflict (subject_id, number)
  do update set title = excluded.title, updated_at = now()
  returning id into v_topic_id;

  delete from public.subquestions where topic_id = v_topic_id;

  for sub_item in
    select value, ordinality
    from jsonb_array_elements(coalesce(topic_payload->'podotazky', topic_payload->'subquestions', '[]'::jsonb)) with ordinality
  loop
    insert into public.subquestions (topic_id, letter, prompt, order_index)
    values (
      v_topic_id,
      coalesce(sub_item.value->>'pismeno', sub_item.value->>'letter'),
      coalesce(sub_item.value->>'zneni', sub_item.value->>'prompt'),
      sub_item.ordinality
    )
    returning id into v_subquestion_id;

    for section_item in
      select value, ordinality
      from jsonb_array_elements(coalesce(sub_item.value->'studium'->'sekce', sub_item.value->'study'->'sections', '[]'::jsonb)) with ordinality
    loop
      insert into public.study_sections (subquestion_id, title, content, list_items, mnemonic, order_index)
      values (
        v_subquestion_id,
        coalesce(section_item.value->>'nadpis', section_item.value->>'title'),
        coalesce(section_item.value->>'obsah', section_item.value->>'content'),
        coalesce(section_item.value->'seznam', section_item.value->'list', '[]'::jsonb),
        coalesce(section_item.value->>'mnemotechnika', section_item.value->>'mnemonic'),
        section_item.ordinality
      )
      returning id into v_section_id;

      table_payload := coalesce(section_item.value->'tabulka', section_item.value->'tables');

      if table_payload is not null and jsonb_typeof(table_payload) = 'object' then
        insert into public.section_tables (section_id, columns, rows, order_index)
        values (
          v_section_id,
          coalesce(table_payload->'sloupce', table_payload->'columns', '[]'::jsonb),
          coalesce(table_payload->'radky', table_payload->'rows', '[]'::jsonb),
          1
        );
      elsif table_payload is not null and jsonb_typeof(table_payload) = 'array' then
        for table_item in
          select value, ordinality
          from jsonb_array_elements(table_payload) with ordinality
        loop
          insert into public.section_tables (section_id, columns, rows, order_index)
          values (
            v_section_id,
            coalesce(table_item.value->'sloupce', table_item.value->'columns', '[]'::jsonb),
            coalesce(table_item.value->'radky', table_item.value->'rows', '[]'::jsonb),
            table_item.ordinality
          );
        end loop;
      end if;

      for image_item in
        select value, ordinality
        from jsonb_array_elements(coalesce(section_item.value->'obrazky', section_item.value->'images', '[]'::jsonb)) with ordinality
      loop
        insert into public.section_images (section_id, src, caption, order_index)
        values (
          v_section_id,
          image_item.value->>'src',
          coalesce(image_item.value->>'popis', image_item.value->>'caption'),
          image_item.ordinality
        );
      end loop;
    end loop;

    for checklist_item in
      select value, ordinality
      from jsonb_array_elements(coalesce(sub_item.value->'studium'->'exam_checklist', sub_item.value->'study'->'examChecklist', '[]'::jsonb)) with ordinality
    loop
      insert into public.exam_checklist_items (subquestion_id, text, order_index)
      values (v_subquestion_id, checklist_item.value #>> '{}', checklist_item.ordinality);
    end loop;

    for flashcard_item in
      select value, ordinality
      from jsonb_array_elements(coalesce(sub_item.value->'flashcards', '[]'::jsonb)) with ordinality
    loop
      insert into public.flashcards (subquestion_id, question, answer, order_index)
      values (
        v_subquestion_id,
        coalesce(flashcard_item.value->>'otazka', flashcard_item.value->>'question'),
        coalesce(flashcard_item.value->>'odpoved', flashcard_item.value->>'answer'),
        flashcard_item.ordinality
      );
    end loop;

    for quiz_item in
      select value, ordinality
      from jsonb_array_elements(coalesce(sub_item.value->'kviz', sub_item.value->'quiz', '[]'::jsonb)) with ordinality
    loop
      insert into public.quiz_questions (subquestion_id, question, explanation, correct_option_index, order_index)
      values (
        v_subquestion_id,
        coalesce(quiz_item.value->>'otazka', quiz_item.value->>'question'),
        coalesce(quiz_item.value->>'vysvetleni', quiz_item.value->>'explanation'),
        coalesce((quiz_item.value->>'spravna')::integer, (quiz_item.value->>'correct')::integer, 0),
        quiz_item.ordinality
      )
      returning id into v_quiz_question_id;

      for option_item in
        select value, ordinality
        from jsonb_array_elements(coalesce(quiz_item.value->'moznosti', quiz_item.value->'options', '[]'::jsonb)) with ordinality
      loop
        insert into public.quiz_options (quiz_question_id, text, option_index)
        values (v_quiz_question_id, option_item.value #>> '{}', option_item.ordinality - 1);
      end loop;
    end loop;
  end loop;
end;
$$;

create or replace view public.topic_payloads
with (security_invoker = true)
as
select
  s.slug as subject_slug,
  t.number as topic_number,
  jsonb_build_object(
    'id', t.number,
    'nazev', t.title,
    'podotazky', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'pismeno', sq.letter,
          'zneni', sq.prompt,
          'studium', jsonb_build_object(
            'sekce', coalesce((
              select jsonb_agg(
                jsonb_strip_nulls(jsonb_build_object(
                  'nadpis', ss.title,
                  'obsah', ss.content,
                  'seznam', ss.list_items,
                  'mnemotechnika', ss.mnemonic,
                  'tabulka', coalesce((
                    select case
                      when count(*) = 0 then null
                      when count(*) = 1 then (jsonb_agg(jsonb_build_object('sloupce', st.columns, 'radky', st.rows) order by st.order_index)->0)
                      else jsonb_agg(jsonb_build_object('sloupce', st.columns, 'radky', st.rows) order by st.order_index)
                    end
                    from public.section_tables st
                    where st.section_id = ss.id
                  ), null),
                  'obrazky', coalesce((
                    select jsonb_agg(jsonb_build_object('src', si.src, 'popis', si.caption) order by si.order_index)
                    from public.section_images si
                    where si.section_id = ss.id
                  ), '[]'::jsonb)
                ))
                order by ss.order_index
              )
              from public.study_sections ss
              where ss.subquestion_id = sq.id
            ), '[]'::jsonb),
            'exam_checklist', coalesce((
              select jsonb_agg(eci.text order by eci.order_index)
              from public.exam_checklist_items eci
              where eci.subquestion_id = sq.id
            ), '[]'::jsonb)
          ),
          'flashcards', coalesce((
            select jsonb_agg(jsonb_build_object('otazka', f.question, 'odpoved', f.answer) order by f.order_index)
            from public.flashcards f
            where f.subquestion_id = sq.id
          ), '[]'::jsonb),
          'kviz', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'otazka', qq.question,
                'moznosti', coalesce((
                  select jsonb_agg(qo.text order by qo.option_index)
                  from public.quiz_options qo
                  where qo.quiz_question_id = qq.id
                ), '[]'::jsonb),
                'spravna', qq.correct_option_index,
                'vysvetleni', qq.explanation
              )
              order by qq.order_index
            )
            from public.quiz_questions qq
            where qq.subquestion_id = sq.id
          ), '[]'::jsonb)
        )
        order by sq.order_index
      )
      from public.subquestions sq
      where sq.topic_id = t.id
    ), '[]'::jsonb)
  ) as payload
from public.topics t
join public.subjects s on s.id = t.subject_id
where t.published = true;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.subquestions enable row level security;
alter table public.study_sections enable row level security;
alter table public.section_tables enable row level security;
alter table public.section_images enable row level security;
alter table public.exam_checklist_items enable row level security;
alter table public.flashcards enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.user_progress enable row level security;
alter table public.content_audit_log enable row level security;

create policy "authenticated users can read core content" on public.subjects for select to authenticated using (true);
create policy "authenticated users can read topics" on public.topics for select to authenticated using (published = true or public.current_user_has_permission('content.edit'));
create policy "authenticated users can read subquestions" on public.subquestions for select to authenticated using (true);
create policy "authenticated users can read study sections" on public.study_sections for select to authenticated using (true);
create policy "authenticated users can read section tables" on public.section_tables for select to authenticated using (true);
create policy "authenticated users can read section images" on public.section_images for select to authenticated using (true);
create policy "authenticated users can read checklists" on public.exam_checklist_items for select to authenticated using (true);
create policy "authenticated users can read flashcards" on public.flashcards for select to authenticated using (true);
create policy "authenticated users can read quiz questions" on public.quiz_questions for select to authenticated using (true);
create policy "authenticated users can read quiz options" on public.quiz_options for select to authenticated using (true);

create policy "admins can manage roles" on public.roles for all to authenticated using (public.current_user_has_permission('roles.manage')) with check (public.current_user_has_permission('roles.manage'));
create policy "admins can manage permissions" on public.permissions for all to authenticated using (public.current_user_has_permission('roles.manage')) with check (public.current_user_has_permission('roles.manage'));
create policy "admins can manage role permissions" on public.role_permissions for all to authenticated using (public.current_user_has_permission('roles.manage')) with check (public.current_user_has_permission('roles.manage'));
create policy "admins can manage classes" on public.classes for all to authenticated using (public.current_user_has_permission('classes.manage')) with check (public.current_user_has_permission('classes.manage'));
create policy "admins can manage members" on public.class_members for all to authenticated using (public.current_user_has_permission('classes.manage')) with check (public.current_user_has_permission('classes.manage'));

create policy "editors can manage subjects" on public.subjects for all to authenticated using (public.current_user_has_permission('subjects.manage')) with check (public.current_user_has_permission('subjects.manage'));
create policy "editors can manage topics" on public.topics for all to authenticated using (public.current_user_has_permission('content.edit')) with check (public.current_user_has_permission('content.edit'));
create policy "editors can manage subquestions" on public.subquestions for all to authenticated using (public.current_user_has_permission('content.edit')) with check (public.current_user_has_permission('content.edit'));
create policy "editors can manage study sections" on public.study_sections for all to authenticated using (public.current_user_has_permission('content.edit')) with check (public.current_user_has_permission('content.edit'));
create policy "editors can manage section tables" on public.section_tables for all to authenticated using (public.current_user_has_permission('content.edit')) with check (public.current_user_has_permission('content.edit'));
create policy "editors can manage section images" on public.section_images for all to authenticated using (public.current_user_has_permission('content.edit')) with check (public.current_user_has_permission('content.edit'));
create policy "editors can manage checklists" on public.exam_checklist_items for all to authenticated using (public.current_user_has_permission('content.edit')) with check (public.current_user_has_permission('content.edit'));
create policy "editors can manage flashcards" on public.flashcards for all to authenticated using (public.current_user_has_permission('flashcards.edit')) with check (public.current_user_has_permission('flashcards.edit'));
create policy "editors can manage quiz questions" on public.quiz_questions for all to authenticated using (public.current_user_has_permission('quizzes.edit')) with check (public.current_user_has_permission('quizzes.edit'));
create policy "editors can manage quiz options" on public.quiz_options for all to authenticated using (public.current_user_has_permission('quizzes.edit')) with check (public.current_user_has_permission('quizzes.edit'));

create policy "users can read own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.current_user_has_permission('users.manage'));
create policy "admins can manage profiles" on public.profiles for all to authenticated using (public.current_user_has_permission('users.manage')) with check (public.current_user_has_permission('users.manage'));
create policy "users can manage own progress" on public.user_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins can read audit log" on public.content_audit_log for select to authenticated using (public.current_user_has_permission('content.publish'));

insert into public.permissions (key, label) values
  ('users.manage', 'Sprava uzivatelu'),
  ('roles.manage', 'Sprava roli a opravneni'),
  ('classes.manage', 'Sprava skupin'),
  ('subjects.manage', 'Sprava predmetu'),
  ('content.view', 'Zobrazeni obsahu'),
  ('content.create', 'Vytvareni obsahu'),
  ('content.edit', 'Editace obsahu'),
  ('content.delete', 'Mazani obsahu'),
  ('content.publish', 'Publikovani obsahu'),
  ('flashcards.edit', 'Editace flashcards'),
  ('quizzes.edit', 'Editace kvizu')
on conflict (key) do nothing;

insert into public.roles (name, label) values
  ('admin', 'Admin'),
  ('editor', 'Editor'),
  ('student', 'Student')
on conflict (name) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on (
  r.name = 'admin'
  or (r.name = 'editor' and p.key in ('content.view', 'content.create', 'content.edit', 'flashcards.edit', 'quizzes.edit'))
  or (r.name = 'student' and p.key in ('content.view'))
)
on conflict do nothing;

insert into public.subjects (slug, name, order_index) values
  ('geografie', 'Geografie', 1),
  ('obcanska-vychova', 'Obcanska vychova', 2)
on conflict (slug) do nothing;

grant usage on schema public to authenticated;
grant execute on function public.current_user_has_permission(text) to authenticated;
grant execute on function public.replace_topic_from_payload(text, jsonb) to authenticated;
grant select on public.topic_payloads to authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.roles,
  public.permissions,
  public.role_permissions,
  public.classes,
  public.class_members,
  public.subjects,
  public.topics,
  public.subquestions,
  public.study_sections,
  public.section_tables,
  public.section_images,
  public.exam_checklist_items,
  public.flashcards,
  public.quiz_questions,
  public.quiz_options,
  public.user_progress,
  public.content_audit_log
to authenticated;
