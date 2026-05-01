export const SUBQUESTION_TITLES = {
  1: { A: 'Kartografie', B: 'Biomy', C: 'Terénní výuka' },
  2: { A: 'Tvar Země', B: 'Klimatická změna', C: 'Popis obrázku' },
  3: { A: 'Mapový obsah', B: 'Geologické procesy', C: 'Data v geografii' },
  4: { A: 'Geografický výzkum', B: 'Půdní pokryv', C: 'Myšlenková mapa' },
  5: { A: 'Věková pyramida', B: 'Půdy ČR', C: 'Demografická revoluce' },
  6: { A: 'Mapová díla', B: 'Krajinná rizika', C: 'Vývoj měst' },
  7: { A: 'Geoinformatika', B: 'Horniny', C: 'Sídla' },
  8: { A: 'DPZ', B: 'Geomorfologie', C: 'Průmysl' },
  9: { A: 'Navigační systémy', B: 'Reliéf', C: 'Město a venkov' },
  10: { A: 'Geografie jako věda', B: 'Litosférické desky', C: 'Venkov' },
  11: { A: 'Terénní výuka', B: 'Atmosféra', C: 'Zemědělství' },
  12: { A: 'Pohyby Země', B: 'Počasí', C: 'Průmysl' },
  13: { A: 'Čas', B: 'Cirkulace atmosféry', C: 'Globalizace' },
  14: { A: 'Terénní kartografie', B: 'Klima místa', C: 'Doprava' },
  15: { A: 'Slapové jevy', B: 'Voda na Zemi', C: 'Trendy v dopravě' },
  16: { A: 'Kompozice mapy', B: 'Vodní tok', C: 'Maloobchod' },
  17: { A: 'Regionální problém', B: 'Georeliéf', C: 'Cestovní ruch' },
  18: { A: 'Technologie ve výuce', B: 'Oceány a El Niño', C: 'Brno' },
  19: { A: 'GIS mapa' },
}

export function getSubquestionShortTitle(topicNumber, letter) {
  return SUBQUESTION_TITLES[topicNumber]?.[letter] ?? ''
}
