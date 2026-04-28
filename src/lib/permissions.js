export const PERMISSIONS = {
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  CLASSES_MANAGE: 'classes.manage',
  SUBJECTS_MANAGE: 'subjects.manage',
  CONTENT_VIEW: 'content.view',
  CONTENT_CREATE: 'content.create',
  CONTENT_EDIT: 'content.edit',
  CONTENT_DELETE: 'content.delete',
  CONTENT_PUBLISH: 'content.publish',
  FLASHCARDS_EDIT: 'flashcards.edit',
  QUIZZES_EDIT: 'quizzes.edit',
}

export const DEFAULT_ROLES = [
  {
    name: 'admin',
    label: 'Admin',
    permissions: Object.values(PERMISSIONS),
  },
  {
    name: 'editor',
    label: 'Editor',
    permissions: [
      PERMISSIONS.CONTENT_VIEW,
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_EDIT,
      PERMISSIONS.FLASHCARDS_EDIT,
      PERMISSIONS.QUIZZES_EDIT,
    ],
  },
  {
    name: 'student',
    label: 'Student',
    permissions: [PERMISSIONS.CONTENT_VIEW],
  },
]
