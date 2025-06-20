const countriesData = [
  {
    name: "Afghanistan",
    capital: "Kabul",
    flag: "https://flagcdn.com/af.svg"
  },
  {
    name: "Albania",
    capital: "Tirana",
    flag: "https://flagcdn.com/al.svg"
  },
  {
    name: "Algeria",
    capital: "Algiers",
    flag: "https://flagcdn.com/dz.svg"
  },
  {
    name: "Andorra",
    capital: "Andorra la Vella",
    flag: "https://flagcdn.com/ad.svg"
  },
  {
    name: "Angola",
    capital: "Luanda",
    flag: "https://flagcdn.com/ao.svg"
  },
  {
    name: "Antigua and Barbuda",
    capital: "Saint John's",
    flag: "https://flagcdn.com/ag.svg"
  },
  {
    name: "Argentina",
    capital: "Buenos Aires",
    flag: "https://flagcdn.com/ar.svg"
  },
  {
    name: "Armenia",
    capital: "Yerevan",
    flag: "https://flagcdn.com/am.svg"
  },
  {
    name: "Australia",
    capital: "Canberra",
    flag: "https://flagcdn.com/au.svg"
  },
  {
    name: "Austria",
    capital: "Vienna",
    flag: "https://flagcdn.com/at.svg"
  },
  {
    name: "Azerbaijan",
    capital: "Baku",
    flag: "https://flagcdn.com/az.svg"
  },
  {
    name: "Bahamas",
    capital: "Nassau",
    flag: "https://flagcdn.com/bs.svg"
  },
  {
    name: "Bahrain",
    capital: "Manama",
    flag: "https://flagcdn.com/bh.svg"
  },
  {
    name: "Bangladesh",
    capital: "Dhaka",
    flag: "https://flagcdn.com/bd.svg"
  },
  {
    name: "Barbados",
    capital: "Bridgetown",
    flag: "https://flagcdn.com/bb.svg"
  },
  {
    name: "Belarus",
    capital: "Minsk",
    flag: "https://flagcdn.com/by.svg"
  },
  {
    name: "Belgium",
    capital: "Brussels",
    flag: "https://flagcdn.com/be.svg"
  },
  {
    name: "Belize",
    capital: "Belmopan",
    flag: "https://flagcdn.com/bz.svg"
  },
  {
    name: "Benin",
    capital: "Porto-Novo",
    flag: "https://flagcdn.com/bj.svg"
  },
  {
    name: "Bhutan",
    capital: "Thimphu",
    flag: "https://flagcdn.com/bt.svg"
  },
  {
    name: "Bolivia",
    capital: "Sucre",
    flag: "https://flagcdn.com/bo.svg"
  },
  {
    name: "Bosnia and Herzegovina",
    capital: "Sarajevo",
    flag: "https://flagcdn.com/ba.svg"
  },
  {
    name: "Botswana",
    capital: "Gaborone",
    flag: "https://flagcdn.com/bw.svg"
  },
  {
    name: "Brazil",
    capital: "Brasília",
    flag: "https://flagcdn.com/br.svg"
  },
  {
    name: "Brunei",
    capital: "Bandar Seri Begawan",
    flag: "https://flagcdn.com/bn.svg"
  },
  {
    name: "Bulgaria",
    capital: "Sofia",
    flag: "https://flagcdn.com/bg.svg"
  },
  {
    name: "Burkina Faso",
    capital: "Ouagadougou",
    flag: "https://flagcdn.com/bf.svg"
  },
  {
    name: "Burundi",
    capital: "Gitega",
    flag: "https://flagcdn.com/bi.svg"
  },
  {
    name: "Cambodia",
    capital: "Phnom Penh",
    flag: "https://flagcdn.com/kh.svg"
  },
  {
    name: "Cameroon",
    capital: "Yaoundé",
    flag: "https://flagcdn.com/cm.svg"
  },
  {
    name: "Canada",
    capital: "Ottawa",
    flag: "https://flagcdn.com/ca.svg"
  },
  {
    name: "Cape Verde",
    capital: "Praia",
    flag: "https://flagcdn.com/cv.svg"
  },
  {
    name: "Central African Republic",
    capital: "Bangui",
    flag: "https://flagcdn.com/cf.svg"
  },
  {
    name: "Chad",
    capital: "N'Djamena",
    flag: "https://flagcdn.com/td.svg"
  },
  {
    name: "Chile",
    capital: "Santiago",
    flag: "https://flagcdn.com/cl.svg"
  },
  {
    name: "China",
    capital: "Beijing",
    flag: "https://flagcdn.com/cn.svg"
  },
  {
    name: "Colombia",
    capital: "Bogotá",
    flag: "https://flagcdn.com/co.svg"
  },
  {
    name: "Comoros",
    capital: "Moroni",
    flag: "https://flagcdn.com/km.svg"
  },
  {
    name: "Congo (Democratic Republic)",
    capital: "Kinshasa",
    flag: "https://flagcdn.com/cd.svg"
  },
  {
    name: "Congo (Republic)",
    capital: "Brazzaville",
    flag: "https://flagcdn.com/cg.svg"
  },
  {
    name: "Costa Rica",
    capital: "San José",
    flag: "https://flagcdn.com/cr.svg"
  },
  {
    name: "Croatia",
    capital: "Zagreb",
    flag: "https://flagcdn.com/hr.svg"
  },
  {
    name: "Cuba",
    capital: "Havana",
    flag: "https://flagcdn.com/cu.svg"
  },
  {
    name: "Cyprus",
    capital: "Nicosia",
    flag: "https://flagcdn.com/cy.svg"
  },
  {
    name: "Czech Republic",
    capital: "Prague",
    flag: "https://flagcdn.com/cz.svg"
  },
  {
    name: "Denmark",
    capital: "Copenhagen",
    flag: "https://flagcdn.com/dk.svg"
  },
  {
    name: "Djibouti",
    capital: "Djibouti",
    flag: "https://flagcdn.com/dj.svg"
  },
  {
    name: "Dominica",
    capital: "Roseau",
    flag: "https://flagcdn.com/dm.svg"
  },
  {
    name: "Dominican Republic",
    capital: "Santo Domingo",
    flag: "https://flagcdn.com/do.svg"
  },
  {
    name: "East Timor",
    capital: "Dili",
    flag: "https://flagcdn.com/tl.svg"
  },
  {
    name: "Ecuador",
    capital: "Quito",
    flag: "https://flagcdn.com/ec.svg"
  },
  {
    name: "Egypt",
    capital: "Cairo",
    flag: "https://flagcdn.com/eg.svg"
  },
  {
    name: "El Salvador",
    capital: "San Salvador",
    flag: "https://flagcdn.com/sv.svg"
  },
  {
    name: "Equatorial Guinea",
    capital: "Malabo",
    flag: "https://flagcdn.com/gq.svg"
  },
  {
    name: "Eritrea",
    capital: "Asmara",
    flag: "https://flagcdn.com/er.svg"
  },
  {
    name: "Estonia",
    capital: "Tallinn",
    flag: "https://flagcdn.com/ee.svg"
  },
  {
    name: "Eswatini",
    capital: "Mbabane",
    flag: "https://flagcdn.com/sz.svg"
  },
  {
    name: "Ethiopia",
    capital: "Addis Ababa",
    flag: "https://flagcdn.com/et.svg"
  },
  {
    name: "Fiji",
    capital: "Suva",
    flag: "https://flagcdn.com/fj.svg"
  },
  {
    name: "Finland",
    capital: "Helsinki",
    flag: "https://flagcdn.com/fi.svg"
  },
  {
    name: "France",
    capital: "Paris",
    flag: "https://flagcdn.com/fr.svg"
  },
  {
    name: "Gabon",
    capital: "Libreville",
    flag: "https://flagcdn.com/ga.svg"
  },
  {
    name: "Gambia",
    capital: "Banjul",
    flag: "https://flagcdn.com/gm.svg"
  },
  {
    name: "Georgia",
    capital: "Tbilisi",
    flag: "https://flagcdn.com/ge.svg"
  },
  {
    name: "Germany",
    capital: "Berlin",
    flag: "https://flagcdn.com/de.svg"
  },
  {
    name: "Ghana",
    capital: "Accra",
    flag: "https://flagcdn.com/gh.svg"
  },
  {
    name: "Greece",
    capital: "Athens",
    flag: "https://flagcdn.com/gr.svg"
  },
  {
    name: "Grenada",
    capital: "St. George's",
    flag: "https://flagcdn.com/gd.svg"
  },
  {
    name: "Guatemala",
    capital: "Guatemala City",
    flag: "https://flagcdn.com/gt.svg"
  },
  {
    name: "Guinea",
    capital: "Conakry",
    flag: "https://flagcdn.com/gn.svg"
  },
  {
    name: "Guinea-Bissau",
    capital: "Bissau",
    flag: "https://flagcdn.com/gw.svg"
  },
  {
    name: "Guyana",
    capital: "Georgetown",
    flag: "https://flagcdn.com/gy.svg"
  },
  {
    name: "Haiti",
    capital: "Port-au-Prince",
    flag: "https://flagcdn.com/ht.svg"
  },
  {
    name: "Honduras",
    capital: "Tegucigalpa",
    flag: "https://flagcdn.com/hn.svg"
  },
  {
    name: "Hungary",
    capital: "Budapest",
    flag: "https://flagcdn.com/hu.svg"
  },
  {
    name: "Iceland",
    capital: "Reykjavik",
    flag: "https://flagcdn.com/is.svg"
  },
  {
    name: "India",
    capital: "New Delhi",
    flag: "https://flagcdn.com/in.svg"
  },
  {
    name: "Indonesia",
    capital: "Jakarta",
    flag: "https://flagcdn.com/id.svg"
  },
  {
    name: "Iran",
    capital: "Tehran",
    flag: "https://flagcdn.com/ir.svg"
  },
  {
    name: "Iraq",
    capital: "Baghdad",
    flag: "https://flagcdn.com/iq.svg"
  },
  {
    name: "Ireland",
    capital: "Dublin",
    flag: "https://flagcdn.com/ie.svg"
  },
  {
    name: "Israel",
    capital: "Jerusalem",
    flag: "https://flagcdn.com/il.svg"
  },
  {
    name: "Italy",
    capital: "Rome",
    flag: "https://flagcdn.com/it.svg"
  },
  {
    name: "Jamaica",
    capital: "Kingston",
    flag: "https://flagcdn.com/jm.svg"
  },
  {
    name: "Japan",
    capital: "Tokyo",
    flag: "https://flagcdn.com/jp.svg"
  },
  {
    name: "Jordan",
    capital: "Amman",
    flag: "https://flagcdn.com/jo.svg"
  },
  {
    name: "Kazakhstan",
    capital: "Nur-Sultan",
    flag: "https://flagcdn.com/kz.svg"
  },
  {
    name: "Kenya",
    capital: "Nairobi",
    flag: "https://flagcdn.com/ke.svg"
  },
  {
    name: "Kiribati",
    capital: "South Tarawa",
    flag: "https://flagcdn.com/ki.svg"
  },
  {
    name: "Kosovo",
    capital: "Pristina",
    flag: "https://flagcdn.com/xk.svg"
  },
  {
    name: "Kuwait",
    capital: "Kuwait City",
    flag: "https://flagcdn.com/kw.svg"
  },
  {
    name: "Kyrgyzstan",
    capital: "Bishkek",
    flag: "https://flagcdn.com/kg.svg"
  },
  {
    name: "Laos",
    capital: "Vientiane",
    flag: "https://flagcdn.com/la.svg"
  },
  {
    name: "Latvia",
    capital: "Riga",
    flag: "https://flagcdn.com/lv.svg"
  },
  {
    name: "Lebanon",
    capital: "Beirut",
    flag: "https://flagcdn.com/lb.svg"
  },
  {
    name: "Lesotho",
    capital: "Maseru",
    flag: "https://flagcdn.com/ls.svg"
  },
  {
    name: "Liberia",
    capital: "Monrovia",
    flag: "https://flagcdn.com/lr.svg"
  },
  {
    name: "Libya",
    capital: "Tripoli",
    flag: "https://flagcdn.com/ly.svg"
  },
  {
    name: "Liechtenstein",
    capital: "Vaduz",
    flag: "https://flagcdn.com/li.svg"
  },
  {
    name: "Lithuania",
    capital: "Vilnius",
    flag: "https://flagcdn.com/lt.svg"
  },
  {
    name: "Luxembourg",
    capital: "Luxembourg City",
    flag: "https://flagcdn.com/lu.svg"
  },
  {
    name: "Madagascar",
    capital: "Antananarivo",
    flag: "https://flagcdn.com/mg.svg"
  },
  {
    name: "Malawi",
    capital: "Lilongwe",
    flag: "https://flagcdn.com/mw.svg"
  },
  {
    name: "Malaysia",
    capital: "Kuala Lumpur",
    flag: "https://flagcdn.com/my.svg"
  },
  {
    name: "Maldives",
    capital: "Malé",
    flag: "https://flagcdn.com/mv.svg"
  },
  {
    name: "Mali",
    capital: "Bamako",
    flag: "https://flagcdn.com/ml.svg"
  },
  {
    name: "Malta",
    capital: "Valletta",
    flag: "https://flagcdn.com/mt.svg"
  },
  {
    name: "Marshall Islands",
    capital: "Majuro",
    flag: "https://flagcdn.com/mh.svg"
  },
  {
    name: "Mauritania",
    capital: "Nouakchott",
    flag: "https://flagcdn.com/mr.svg"
  },
  {
    name: "Mauritius",
    capital: "Port Louis",
    flag: "https://flagcdn.com/mu.svg"
  },
  {
    name: "Mexico",
    capital: "Mexico City",
    flag: "https://flagcdn.com/mx.svg"
  },
  {
    name: "Micronesia",
    capital: "Palikir",
    flag: "https://flagcdn.com/fm.svg"
  },
  {
    name: "Moldova",
    capital: "Chișinău",
    flag: "https://flagcdn.com/md.svg"
  },
  {
    name: "Monaco",
    capital: "Monaco",
    flag: "https://flagcdn.com/mc.svg"
  },
  {
    name: "Mongolia",
    capital: "Ulaanbaatar",
    flag: "https://flagcdn.com/mn.svg"
  },
  {
    name: "Montenegro",
    capital: "Podgorica",
    flag: "https://flagcdn.com/me.svg"
  },
  {
    name: "Morocco",
    capital: "Rabat",
    flag: "https://flagcdn.com/ma.svg"
  },
  {
    name: "Mozambique",
    capital: "Maputo",
    flag: "https://flagcdn.com/mz.svg"
  },
  {
    name: "Myanmar",
    capital: "Naypyidaw",
    flag: "https://flagcdn.com/mm.svg"
  },
  {
    name: "Namibia",
    capital: "Windhoek",
    flag: "https://flagcdn.com/na.svg"
  },
  {
    name: "Nauru",
    capital: "Yaren",
    flag: "https://flagcdn.com/nr.svg"
  },
  {
    name: "Nepal",
    capital: "Kathmandu",
    flag: "https://flagcdn.com/np.svg"
  },
  {
    name: "Netherlands",
    capital: "Amsterdam",
    flag: "https://flagcdn.com/nl.svg"
  },
  {
    name: "New Zealand",
    capital: "Wellington",
    flag: "https://flagcdn.com/nz.svg"
  },
  {
    name: "Nicaragua",
    capital: "Managua",
    flag: "https://flagcdn.com/ni.svg"
  },
  {
    name: "Niger",
    capital: "Niamey",
    flag: "https://flagcdn.com/ne.svg"
  },
  {
    name: "Nigeria",
    capital: "Abuja",
    flag: "https://flagcdn.com/ng.svg"
  },
  {
    name: "North Korea",
    capital: "Pyongyang",
    flag: "https://flagcdn.com/kp.svg"
  },
  {
    name: "North Macedonia",
    capital: "Skopje",
    flag: "https://flagcdn.com/mk.svg"
  },
  {
    name: "Norway",
    capital: "Oslo",
    flag: "https://flagcdn.com/no.svg"
  },
  {
    name: "Oman",
    capital: "Muscat",
    flag: "https://flagcdn.com/om.svg"
  },
  {
    name: "Pakistan",
    capital: "Islamabad",
    flag: "https://flagcdn.com/pk.svg"
  },
  {
    name: "Palau",
    capital: "Ngerulmud",
    flag: "https://flagcdn.com/pw.svg"
  },
  {
    name: "Palestine",
    capital: "Ramallah",
    flag: "https://flagcdn.com/ps.svg"
  },
  {
    name: "Panama",
    capital: "Panama City",
    flag: "https://flagcdn.com/pa.svg"
  },
  {
    name: "Papua New Guinea",
    capital: "Port Moresby",
    flag: "https://flagcdn.com/pg.svg"
  },
  {
    name: "Paraguay",
    capital: "Asunción",
    flag: "https://flagcdn.com/py.svg"
  },
  {
    name: "Peru",
    capital: "Lima",
    flag: "https://flagcdn.com/pe.svg"
  },
  {
    name: "Philippines",
    capital: "Manila",
    flag: "https://flagcdn.com/ph.svg"
  },
  {
    name: "Poland",
    capital: "Warsaw",
    flag: "https://flagcdn.com/pl.svg"
  },
  {
    name: "Portugal",
    capital: "Lisbon",
    flag: "https://flagcdn.com/pt.svg"
  },
  {
    name: "Qatar",
    capital: "Doha",
    flag: "https://flagcdn.com/qa.svg"
  },
  {
    name: "Romania",
    capital: "Bucharest",
    flag: "https://flagcdn.com/ro.svg"
  },
  {
    name: "Russia",
    capital: "Moscow",
    flag: "https://flagcdn.com/ru.svg"
  },
  {
    name: "Rwanda",
    capital: "Kigali",
    flag: "https://flagcdn.com/rw.svg"
  },
  {
    name: "Saint Kitts and Nevis",
    capital: "Basseterre",
    flag: "https://flagcdn.com/kn.svg"
  },
  {
    name: "Saint Lucia",
    capital: "Castries",
    flag: "https://flagcdn.com/lc.svg"
  },
  {
    name: "Saint Vincent and the Grenadines",
    capital: "Kingstown",
    flag: "https://flagcdn.com/vc.svg"
  },
  {
    name: "Samoa",
    capital: "Apia",
    flag: "https://flagcdn.com/ws.svg"
  },
  {
    name: "San Marino",
    capital: "San Marino",
    flag: "https://flagcdn.com/sm.svg"
  },
  {
    name: "São Tomé and Príncipe",
    capital: "São Tomé",
    flag: "https://flagcdn.com/st.svg"
  },
  {
    name: "Saudi Arabia",
    capital: "Riyadh",
    flag: "https://flagcdn.com/sa.svg"
  },
  {
    name: "Senegal",
    capital: "Dakar",
    flag: "https://flagcdn.com/sn.svg"
  },
  {
    name: "Serbia",
    capital: "Belgrade",
    flag: "https://flagcdn.com/rs.svg"
  },
  {
    name: "Seychelles",
    capital: "Victoria",
    flag: "https://flagcdn.com/sc.svg"
  },
  {
    name: "Sierra Leone",
    capital: "Freetown",
    flag: "https://flagcdn.com/sl.svg"
  },
  {
    name: "Singapore",
    capital: "Singapore",
    flag: "https://flagcdn.com/sg.svg"
  },
  {
    name: "Slovakia",
    capital: "Bratislava",
    flag: "https://flagcdn.com/sk.svg"
  },
  {
    name: "Slovenia",
    capital: "Ljubljana",
    flag: "https://flagcdn.com/si.svg"
  },
  {
    name: "Solomon Islands",
    capital: "Honiara",
    flag: "https://flagcdn.com/sb.svg"
  },
  {
    name: "Somalia",
    capital: "Mogadishu",
    flag: "https://flagcdn.com/so.svg"
  },
  {
    name: "South Africa",
    capital: "Pretoria",
    flag: "https://flagcdn.com/za.svg"
  },
  {
    name: "South Korea",
    capital: "Seoul",
    flag: "https://flagcdn.com/kr.svg"
  },
  {
    name: "South Sudan",
    capital: "Juba",
    flag: "https://flagcdn.com/ss.svg"
  },
  {
    name: "Spain",
    capital: "Madrid",
    flag: "https://flagcdn.com/es.svg"
  },
  {
    name: "Sri Lanka",
    capital: "Colombo",
    flag: "https://flagcdn.com/lk.svg"
  },
  {
    name: "Sudan",
    capital: "Khartoum",
    flag: "https://flagcdn.com/sd.svg"
  },
  {
    name: "Suriname",
    capital: "Paramaribo",
    flag: "https://flagcdn.com/sr.svg"
  },
  {
    name: "Sweden",
    capital: "Stockholm",
    flag: "https://flagcdn.com/se.svg"
  },
  {
    name: "Switzerland",
    capital: "Bern",
    flag: "https://flagcdn.com/ch.svg"
  },
  {
    name: "Syria",
    capital: "Damascus",
    flag: "https://flagcdn.com/sy.svg"
  },
  {
    name: "Taiwan",
    capital: "Taipei",
    flag: "https://flagcdn.com/tw.svg"
  },
  {
    name: "Tajikistan",
    capital: "Dushanbe",
    flag: "https://flagcdn.com/tj.svg"
  },
  {
    name: "Tanzania",
    capital: "Dodoma",
    flag: "https://flagcdn.com/tz.svg"
  },
  {
    name: "Thailand",
    capital: "Bangkok",
    flag: "https://flagcdn.com/th.svg"
  },
  {
    name: "Togo",
    capital: "Lomé",
    flag: "https://flagcdn.com/tg.svg"
  },
  {
    name: "Tonga",
    capital: "Nuku'alofa",
    flag: "https://flagcdn.com/to.svg"
  },
  {
    name: "Trinidad and Tobago",
    capital: "Port of Spain",
    flag: "https://flagcdn.com/tt.svg"
  },
  {
    name: "Tunisia",
    capital: "Tunis",
    flag: "https://flagcdn.com/tn.svg"
  },
  {
    name: "Turkey",
    capital: "Ankara",
    flag: "https://flagcdn.com/tr.svg"
  },
  {
    name: "Turkmenistan",
    capital: "Ashgabat",
    flag: "https://flagcdn.com/tm.svg"
  },
  {
    name: "Tuvalu",
    capital: "Funafuti",
    flag: "https://flagcdn.com/tv.svg"
  },
  {
    name: "Uganda",
    capital: "Kampala",
    flag: "https://flagcdn.com/ug.svg"
  },
  {
    name: "Ukraine",
    capital: "Kyiv",
    flag: "https://flagcdn.com/ua.svg"
  },
  {
    name: "United Arab Emirates",
    capital: "Abu Dhabi",
    flag: "https://flagcdn.com/ae.svg"
  },
  {
    name: "United Kingdom",
    capital: "London",
    flag: "https://flagcdn.com/gb.svg"
  },
  {
    name: "United States",
    capital: "Washington, D.C.",
    flag: "https://flagcdn.com/us.svg"
  },
  {
    name: "Uruguay",
    capital: "Montevideo",
    flag: "https://flagcdn.com/uy.svg"
  },
  {
    name: "Uzbekistan",
    capital: "Tashkent",
    flag: "https://flagcdn.com/uz.svg"
  },
  {
    name: "Vanuatu",
    capital: "Port Vila",
    flag: "https://flagcdn.com/vu.svg"
  },
  {
    name: "Vatican City",
    capital: "Vatican City",
    flag: "https://flagcdn.com/va.svg"
  },
  {
    name: "Venezuela",
    capital: "Caracas",
    flag: "https://flagcdn.com/ve.svg"
  },
  {
    name: "Vietnam",
    capital: "Hanoi",
    flag: "https://flagcdn.com/vn.svg"
  },
  {
    name: "Yemen",
    capital: "Sana'a",
    flag: "https://flagcdn.com/ye.svg"
  },
  {
    name: "Zambia",
    capital: "Lusaka",
    flag: "https://flagcdn.com/zm.svg"
  },
  {
    name: "Zimbabwe",
    capital: "Harare",
    flag: "https://flagcdn.com/zw.svg"
  }
]; 