import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, BookOpen, Flag, Trash2, BarChart3, Check, MoreVertical, ArrowRight, Edit3, Compass, Target, MapPin, Briefcase, Settings } from 'lucide-react';

// ==============================
// SG BASELINES (Broadie, scratch benchmark)
// Distances in yards; putting in feet.
// ==============================
const TEE_PAR4 = [[300,3.95],[350,4.02],[400,4.10],[450,4.31],[500,4.55]];
const TEE_PAR5 = [[450,4.46],[500,4.55],[550,4.66],[600,4.78],[650,4.92]];
const FAIRWAY  = [[10,2.18],[20,2.40],[30,2.51],[40,2.60],[50,2.66],[60,2.70],[80,2.75],[100,2.80],[120,2.86],[140,2.93],[160,3.02],[180,3.13],[200,3.23],[220,3.32],[240,3.42],[260,3.52]];
const ROUGH    = [[10,2.34],[20,2.59],[30,2.73],[40,2.83],[50,2.92],[60,2.97],[80,3.04],[100,3.10],[120,3.16],[140,3.23],[160,3.31],[180,3.40],[200,3.49],[220,3.59],[240,3.69],[260,3.78]];
const SAND     = [[10,2.43],[20,2.66],[30,2.82],[40,2.91],[50,2.99],[60,3.06],[80,3.16],[100,3.25],[120,3.34],[140,3.42],[160,3.51],[180,3.61],[200,3.69],[220,3.78],[240,3.86]];
const RECOVERY = [[50,3.45],[100,3.65],[150,3.79],[200,3.95],[250,4.10]];
const PUTT     = [[1,1.001],[2,1.009],[3,1.053],[4,1.147],[5,1.230],[6,1.328],[7,1.402],[8,1.473],[9,1.530],[10,1.594],[15,1.764],[20,1.873],[25,1.953],[30,1.998],[40,2.075],[50,2.150],[60,2.213],[80,2.291],[100,2.355]];

// ==============================
// CADDY — sister app, green reading book
// ==============================
const CADDY_URL = 'https://caddy-zeta.vercel.app';

// ==============================
// COURSE LIBRARY — pre-loaded courses
// Two tiers:
//   1. Header-only: name, location, country, par, yardage, holes count.
//      Shown in library; first round acts as the template for all future ones.
//   2. Full template: hole-by-hole par/yardage/name. Auto-fills every round.
//      Only for courses where data has been independently verified.
// ==============================
const COURSE_PRESETS = [
  // ─── DUBLIN (NORTH) ──────────────────────────────────────────────
  {
    id: 'preset_st_annes',
    name: "St Anne's Golf Club",
    location: 'Bull Island, Dublin',
    country: 'IE',
    par: 71,
    yardage: 6526,
    holes: 18,
    holeTemplate: [
      { hole_num: 1,  par: 5, yardage: 519, name: 'Aldermarsh' },
      { hole_num: 2,  par: 4, yardage: 360, name: "St. Fintan's" },
      { hole_num: 3,  par: 3, yardage: 177, name: 'Cois Ba' },
      { hole_num: 4,  par: 4, yardage: 401, name: 'Black Banks' },
      { hole_num: 5,  par: 4, yardage: 384, name: 'Blue Lagoon' },
      { hole_num: 6,  par: 3, yardage: 159, name: 'Dolly' },
      { hole_num: 7,  par: 4, yardage: 475, name: 'Brent' },
      { hole_num: 8,  par: 4, yardage: 381, name: 'Dublin Bay' },
      { hole_num: 9,  par: 4, yardage: 370, name: 'Furze' },
      { hole_num: 10, par: 3, yardage: 158, name: 'Burren' },
      { hole_num: 11, par: 5, yardage: 523, name: 'Causeway' },
      { hole_num: 12, par: 4, yardage: 432, name: "Ireland's Eye" },
      { hole_num: 13, par: 5, yardage: 480, name: 'Chimney' },
      { hole_num: 14, par: 4, yardage: 388, name: 'Leveret' },
      { hole_num: 15, par: 4, yardage: 378, name: 'Old Clubhouse' },
      { hole_num: 16, par: 4, yardage: 363, name: 'Kish' },
      { hole_num: 17, par: 3, yardage: 178, name: 'Kitchen' },
      { hole_num: 18, par: 4, yardage: 400, name: 'Clubhouse' },
    ],
  },
  { id: 'preset_royal_dublin',     name: 'The Royal Dublin Golf Club', location: 'Dollymount, Dublin',  country: 'IE', par: 72, yardage: 7289, holes: 18 },
  { id: 'preset_clontarf',         name: 'Clontarf Golf Club',         location: 'Clontarf, Dublin',     country: 'IE', par: 71, yardage: 5959, holes: 18 },
  { id: 'preset_deer_park',        name: 'Deer Park Golf Course',      location: 'Howth, Dublin',        country: 'IE', par: 72, yardage: 6647, holes: 18 },
  { id: 'preset_deer_park_st_fintans', name: "Deer Park · St Fintan's (9)", location: 'Howth, Dublin',  country: 'IE', par: 35, yardage: 2900, holes: 9 },
  { id: 'preset_howth',            name: 'Howth Golf Club',            location: 'Sutton, Dublin',       country: 'IE', par: 71, yardage: 6135, holes: 18 },
  { id: 'preset_sutton',           name: 'Sutton Golf Club (9)',       location: 'Sutton, Dublin',       country: 'IE', par: 35, yardage: 2945, holes: 9 },
  { id: 'preset_the_island',       name: 'The Island Golf Club',       location: 'Donabate, Dublin',     country: 'IE', par: 71, yardage: 6796, holes: 18 },
  { id: 'preset_old_portmarnock',  name: 'Portmarnock Golf Club (Old)', location: 'Portmarnock, Dublin', country: 'IE', par: 72, yardage: 7466, holes: 18 },
  { id: 'preset_portmarnock_links', name: 'Portmarnock Hotel & Golf Links', location: 'Portmarnock, Dublin', country: 'IE', par: 71, yardage: 7110, holes: 18 },
  { id: 'preset_malahide',         name: 'Malahide Golf Club',         location: 'Malahide, Dublin',     country: 'IE', par: 71, yardage: 6722, holes: 18 },
  { id: 'preset_roganstown',       name: 'Roganstown Golf & Country Club', location: 'Swords, Dublin',   country: 'IE', par: 72, yardage: 6892, holes: 18 },
  { id: 'preset_swords_open',      name: 'Swords Open Golf Course',    location: 'Swords, Dublin',       country: 'IE', par: 71, yardage: 5663, holes: 18 },
  { id: 'preset_balcarrick',       name: 'Balcarrick Golf Club',       location: 'Donabate, Dublin',     country: 'IE', par: 72, yardage: 6685, holes: 18 },
  { id: 'preset_beaverstown',      name: 'Beaverstown Golf Club',      location: 'Donabate, Dublin',     country: 'IE', par: 71, yardage: 6322, holes: 18 },
  { id: 'preset_jamieson',         name: 'Jameson Golf Links',         location: 'Donabate, Dublin',     country: 'IE', par: 72, yardage: 7174, holes: 18 },
  { id: 'preset_corballis',        name: 'Corballis Links',            location: 'Donabate, Dublin',     country: 'IE', par: 65, yardage: 4971, holes: 18 },
  { id: 'preset_st_margarets',     name: "St Margaret's Golf & Country Club", location: 'Finglas, Dublin', country: 'IE', par: 73, yardage: 6917, holes: 18 },
  { id: 'preset_hollystown',       name: 'Hollystown Golf Club',       location: 'Hollystown, Dublin',   country: 'IE', par: 72, yardage: 6443, holes: 18 },
  { id: 'preset_hollywood_lakes',  name: 'Hollywood Lakes Golf Club',  location: 'Ballyboughal, Dublin', country: 'IE', par: 72, yardage: 7146, holes: 18 },

  // ─── DUBLIN (SOUTH) & WICKLOW ────────────────────────────────────
  { id: 'preset_milltown',         name: 'Milltown Golf Club',         location: 'Milltown, Dublin',     country: 'IE', par: 71, yardage: 6310, holes: 18 },
  { id: 'preset_elm_park',         name: 'Elm Park Golf Club',         location: 'Donnybrook, Dublin',   country: 'IE', par: 69, yardage: 5790, holes: 18 },
  { id: 'preset_elmgreen',         name: 'Elmgreen Golf Course',       location: 'Castleknock, Dublin',  country: 'IE', par: 71, yardage: 6244, holes: 18 },
  { id: 'preset_the_castle',       name: 'The Castle Golf Club',       location: 'Rathfarnham, Dublin',  country: 'IE', par: 70, yardage: 6195, holes: 18 },
  { id: 'preset_the_grange',       name: 'The Grange Golf Club',       location: 'Rathfarnham, Dublin',  country: 'IE', par: 70, yardage: 6087, holes: 18 },
  { id: 'preset_foxrock',          name: 'Foxrock Golf Club (9)',      location: 'Foxrock, Dublin',      country: 'IE', par: 35, yardage: 2949, holes: 9 },
  { id: 'preset_dun_laoghaire_dub',  name: 'Dun Laoghaire · Dublin (9)',   location: 'Ballyman, Wicklow', country: 'IE', par: 36, yardage: 3275, holes: 9 },
  { id: 'preset_dun_laoghaire_glen', name: 'Dun Laoghaire · Glenamuck (9)', location: 'Ballyman, Wicklow', country: 'IE', par: 36, yardage: 3300, holes: 9 },
  { id: 'preset_dun_laoghaire_wick', name: 'Dun Laoghaire · Wicklow (9)',   location: 'Ballyman, Wicklow', country: 'IE', par: 36, yardage: 3360, holes: 9 },
  { id: 'preset_powerscourt_east', name: 'Powerscourt · East',         location: 'Enniskerry, Wicklow',  country: 'IE', par: 72, yardage: 7022, holes: 18 },
  { id: 'preset_powerscourt_west', name: 'Powerscourt · West',         location: 'Enniskerry, Wicklow',  country: 'IE', par: 72, yardage: 6938, holes: 18 },
  { id: 'preset_druids_glen',      name: "Druids Glen Golf Club",      location: 'Newtownmountkennedy, Wicklow', country: 'IE', par: 71, yardage: 7029, holes: 18 },
  { id: 'preset_druids_heath',     name: 'Druids Heath Golf Club',     location: 'Newtownmountkennedy, Wicklow', country: 'IE', par: 71, yardage: 7434, holes: 18 },
  { id: 'preset_european_club',    name: 'The European Club',          location: 'Brittas Bay, Wicklow', country: 'IE', par: 71, yardage: 7355, holes: 18 },
  { id: 'preset_old_conna',        name: 'Old Conna Golf Club',        location: 'Bray, Wicklow',        country: 'IE', par: 72, yardage: 6551, holes: 18 },
  { id: 'preset_woodbrook',        name: 'Woodbrook Golf Club',        location: 'Bray, Wicklow',        country: 'IE', par: 72, yardage: 7028, holes: 18 },
  { id: 'preset_carton_house_omeara',   name: "Carton House · O'Meara",  location: 'Maynooth, Kildare',     country: 'IE', par: 72, yardage: 7006, holes: 18 },
  { id: 'preset_carton_house_montgomerie', name: 'Carton House · Montgomerie', location: 'Maynooth, Kildare', country: 'IE', par: 72, yardage: 7301, holes: 18 },
  { id: 'preset_k_club_palmer',    name: 'The K Club · Palmer North',  location: 'Straffan, Kildare',    country: 'IE', par: 72, yardage: 7350, holes: 18 },

  // ─── IRISH LINKS & FAMOUS COURSES ─────────────────────────────────
  { id: 'preset_ballybunion_old',  name: 'Ballybunion · Old Course',   location: 'Ballybunion, Kerry',   country: 'IE', par: 71, yardage: 6814, holes: 18 },
  { id: 'preset_ballybunion_cashen', name: 'Ballybunion · Cashen',     location: 'Ballybunion, Kerry',   country: 'IE', par: 72, yardage: 6477, holes: 18 },
  { id: 'preset_doonbeg',          name: 'Trump International Doonbeg', location: 'Doonbeg, Clare',      country: 'IE', par: 72, yardage: 6885, holes: 18 },
  { id: 'preset_lahinch_old',      name: 'Lahinch Golf Club · Old',    location: 'Lahinch, Clare',       country: 'IE', par: 72, yardage: 6950, holes: 18 },
  { id: 'preset_lahinch_castle',   name: 'Lahinch Golf Club · Castle', location: 'Lahinch, Clare',       country: 'IE', par: 70, yardage: 5594, holes: 18 },
  { id: 'preset_tralee',           name: 'Tralee Golf Club',           location: 'Tralee, Kerry',        country: 'IE', par: 72, yardage: 6975, holes: 18 },
  { id: 'preset_waterville',       name: 'Waterville Golf Links',      location: 'Waterville, Kerry',    country: 'IE', par: 72, yardage: 7378, holes: 18 },
  { id: 'preset_old_head',         name: 'Old Head Golf Links',        location: 'Kinsale, Cork',        country: 'IE', par: 72, yardage: 7215, holes: 18 },
  { id: 'preset_royal_county_down', name: 'Royal County Down · Championship', location: 'Newcastle, Down', country: 'IE', par: 71, yardage: 7186, holes: 18 },
  { id: 'preset_royal_portrush_dunluce', name: 'Royal Portrush · Dunluce',  location: 'Portrush, Antrim',    country: 'IE', par: 72, yardage: 7344, holes: 18 },
  { id: 'preset_royal_portrush_valley',  name: 'Royal Portrush · Valley',   location: 'Portrush, Antrim',    country: 'IE', par: 70, yardage: 6346, holes: 18 },
  { id: 'preset_portstewart',      name: 'Portstewart Golf Club · Strand',  location: 'Portstewart, Derry', country: 'IE', par: 72, yardage: 7118, holes: 18 },
  { id: 'preset_county_louth',     name: 'County Louth (Baltray)',     location: 'Drogheda, Louth',      country: 'IE', par: 72, yardage: 7068, holes: 18 },

  // ─── UNITED STATES ───────────────────────────────────────────────
  { id: 'preset_pasatiempo',       name: 'Pasatiempo Golf Club',       location: 'Santa Cruz, CA',       country: 'US', par: 71, yardage: 6500, holes: 18 },
  { id: 'preset_pebble_beach',     name: 'Pebble Beach Golf Links',    location: 'Pebble Beach, CA',     country: 'US', par: 72, yardage: 7075, holes: 18 },
  { id: 'preset_spyglass',         name: 'Spyglass Hill Golf Course',  location: 'Pebble Beach, CA',     country: 'US', par: 72, yardage: 7041, holes: 18 },
  { id: 'preset_bandon_dunes',     name: 'Bandon Dunes',               location: 'Bandon, OR',           country: 'US', par: 72, yardage: 6732, holes: 18 },
  { id: 'preset_pacific_dunes',    name: 'Pacific Dunes',              location: 'Bandon, OR',           country: 'US', par: 71, yardage: 6633, holes: 18 },
  { id: 'preset_bethpage_black',   name: 'Bethpage State Park · Black', location: 'Farmingdale, NY',     country: 'US', par: 71, yardage: 7468, holes: 18 },
  { id: 'preset_torrey_pines_south', name: 'Torrey Pines · South',     location: 'La Jolla, CA',         country: 'US', par: 72, yardage: 7765, holes: 18 },
  { id: 'preset_pinehurst_2',      name: 'Pinehurst No. 2',            location: 'Pinehurst, NC',        country: 'US', par: 72, yardage: 7588, holes: 18 },
  { id: 'preset_chambers_bay',     name: 'Chambers Bay',               location: 'University Place, WA', country: 'US', par: 72, yardage: 7585, holes: 18 },
  { id: 'preset_streamsong_red',   name: 'Streamsong · Red',           location: 'Bowling Green, FL',    country: 'US', par: 72, yardage: 7148, holes: 18 },

  // ─── ENGLAND & SCOTLAND ───────────────────────────────────────────
  { id: 'preset_st_andrews_old',   name: 'St Andrews · Old Course',    location: 'St Andrews, Fife',     country: 'GB', par: 72, yardage: 7305, holes: 18 },
  { id: 'preset_st_andrews_new',   name: 'St Andrews · New Course',    location: 'St Andrews, Fife',     country: 'GB', par: 71, yardage: 6625, holes: 18 },
  { id: 'preset_carnoustie',       name: 'Carnoustie · Championship',  location: 'Carnoustie, Angus',    country: 'GB', par: 72, yardage: 7402, holes: 18 },
  { id: 'preset_muirfield',        name: 'Muirfield (HCEG)',           location: 'Gullane, East Lothian', country: 'GB', par: 71, yardage: 7245, holes: 18 },
  { id: 'preset_north_berwick',    name: 'North Berwick · West Links', location: 'North Berwick, East Lothian', country: 'GB', par: 71, yardage: 6506, holes: 18 },
  { id: 'preset_turnberry_ailsa',  name: 'Trump Turnberry · Ailsa',    location: 'Turnberry, Ayrshire',  country: 'GB', par: 71, yardage: 7489, holes: 18 },
  { id: 'preset_royal_birkdale',   name: 'Royal Birkdale',             location: 'Southport, Merseyside', country: 'GB', par: 70, yardage: 7156, holes: 18 },
  { id: 'preset_royal_st_georges', name: "Royal St George's",          location: 'Sandwich, Kent',       country: 'GB', par: 70, yardage: 7204, holes: 18 },
  { id: 'preset_royal_liverpool',  name: 'Royal Liverpool (Hoylake)',  location: 'Hoylake, Merseyside',  country: 'GB', par: 72, yardage: 7311, holes: 18 },
  { id: 'preset_royal_lytham',     name: "Royal Lytham & St Annes",    location: 'Lytham St Annes, Lancs', country: 'GB', par: 70, yardage: 7118, holes: 18 },
  { id: 'preset_sunningdale_old',  name: 'Sunningdale · Old Course',   location: 'Sunningdale, Berkshire', country: 'GB', par: 70, yardage: 6627, holes: 18 },
  { id: 'preset_wentworth_west',   name: 'Wentworth · West (BMW PGA)', location: 'Virginia Water, Surrey', country: 'GB', par: 72, yardage: 7284, holes: 18 },

  // ─── PORTUGAL ────────────────────────────────────────────────────
  { id: 'preset_oitavos_dunes',    name: 'Oitavos Dunes',              location: 'Cascais',              country: 'PT', par: 71, yardage: 6943, holes: 18 },
  { id: 'preset_quinta_do_lago_s', name: 'Quinta do Lago · South',     location: 'Almancil, Algarve',    country: 'PT', par: 72, yardage: 7158, holes: 18 },
  { id: 'preset_san_lorenzo',      name: 'San Lorenzo Golf Course',    location: 'Almancil, Algarve',    country: 'PT', par: 72, yardage: 6822, holes: 18 },
  { id: 'preset_monte_rei',        name: 'Monte Rei · North',          location: 'Vila Nova de Cacela',  country: 'PT', par: 72, yardage: 7187, holes: 18 },
  { id: 'preset_vilamoura_old',    name: 'Vilamoura · Old Course',     location: 'Vilamoura, Algarve',   country: 'PT', par: 73, yardage: 6712, holes: 18 },

  // ─── SPAIN ───────────────────────────────────────────────────────
  { id: 'preset_valderrama',       name: 'Real Club Valderrama',       location: 'Sotogrande, Cádiz',    country: 'ES', par: 71, yardage: 7050, holes: 18 },
  { id: 'preset_pga_catalunya',    name: 'PGA Catalunya · Stadium',    location: 'Caldes de Malavella',  country: 'ES', par: 72, yardage: 7385, holes: 18 },
  { id: 'preset_finca_cortesin',   name: 'Finca Cortesín',             location: 'Casares, Málaga',      country: 'ES', par: 72, yardage: 7524, holes: 18 },
  { id: 'preset_real_sociedad',    name: 'Real Sociedad Hípica Española de Madrid', location: 'Madrid', country: 'ES', par: 72, yardage: 6789, holes: 18 },
  { id: 'preset_la_reserva',       name: 'La Reserva Club Sotogrande', location: 'Sotogrande, Cádiz',    country: 'ES', par: 72, yardage: 7378, holes: 18 },
];

const COUNTRY_LABELS = {
  IE: 'Ireland',
  GB: 'UK',
  US: 'USA',
  PT: 'Portugal',
  ES: 'Spain',
};

const LIE_LABEL = {
  tee: 'Tee', fairway: 'Fairway', rough: 'Rough', sand: 'Sand',
  recovery: 'Recovery', green: 'Green', hole: 'Holed'
};
const LIE_PICKER = [
  { id: 'fairway',  label: 'Fairway' },
  { id: 'rough',    label: 'Rough' },
  { id: 'sand',     label: 'Sand' },
  { id: 'recovery', label: 'Recovery' },
  { id: 'green',    label: 'Green' },
  { id: 'hole',     label: 'Holed' },
];

// Comprehensive club library, grouped for scannable picker.
// Putter excluded — implied for green shots.
const DEFAULT_BAG = [
  // Woods
  { id: 'driver', label: 'Dr',  full: 'Driver',         group: 'Woods' },
  { id: '3w',     label: '3W',  full: '3 Wood',         group: 'Woods' },
  { id: '4w',     label: '4W',  full: '4 Wood',         group: 'Woods' },
  { id: '5w',     label: '5W',  full: '5 Wood',         group: 'Woods' },
  { id: '7w',     label: '7W',  full: '7 Wood',         group: 'Woods' },
  { id: '9w',     label: '9W',  full: '9 Wood',         group: 'Woods' },
  // Hybrids
  { id: '3h',     label: '3H',  full: '3 Hybrid',       group: 'Hybrids' },
  { id: 'hyb',    label: 'Hyb', full: 'Hybrid',         group: 'Hybrids' },
  // Irons
  { id: '4i',     label: '4',   full: '4 Iron',         group: 'Irons' },
  { id: '5i',     label: '5',   full: '5 Iron',         group: 'Irons' },
  { id: '6i',     label: '6',   full: '6 Iron',         group: 'Irons' },
  { id: '7i',     label: '7',   full: '7 Iron',         group: 'Irons' },
  { id: '8i',     label: '8',   full: '8 Iron',         group: 'Irons' },
  { id: '9i',     label: '9',   full: '9 Iron',         group: 'Irons' },
  { id: 'pw',     label: 'PW',  full: 'Pitching Wedge', group: 'Irons' },
  // Wedges
  { id: '48',     label: '48°', full: '48° Wedge',      group: 'Wedges' },
  { id: '50',     label: '50°', full: '50° Wedge',      group: 'Wedges' },
  { id: '52',     label: '52°', full: '52° Wedge',      group: 'Wedges' },
  { id: '54',     label: '54°', full: '54° Wedge',      group: 'Wedges' },
  { id: '56',     label: '56°', full: '56° Wedge',      group: 'Wedges' },
  { id: '58',     label: '58°', full: '58° Wedge',      group: 'Wedges' },
  { id: '60',     label: '60°', full: '60° Wedge',      group: 'Wedges' },
  { id: '62',     label: '62°', full: '62° Wedge',      group: 'Wedges' },
];
const CLUB_GROUPS = ['Woods', 'Hybrids', 'Irons', 'Wedges'];
const CLUB_LABEL = Object.fromEntries(DEFAULT_BAG.map(c => [c.id, c.label]));

// ==============================
// MATH
// ==============================
function interp(t, x){
  if (x <= t[0][0]) return t[0][1];
  if (x >= t[t.length-1][0]) return t[t.length-1][1];
  for (let i = 0; i < t.length-1; i++){
    const [x1,y1] = t[i], [x2,y2] = t[i+1];
    if (x >= x1 && x <= x2) return y1 + ((x-x1)/(x2-x1))*(y2-y1);
  }
  return t[t.length-1][1];
}
function baseline(lie, dist){
  if (lie === 'hole') return 0;
  if (lie === 'green') return interp(PUTT, dist);
  if (lie === 'fairway') return interp(FAIRWAY, dist);
  if (lie === 'rough') return interp(ROUGH, dist);
  if (lie === 'sand') return interp(SAND, dist);
  if (lie === 'recovery') return interp(RECOVERY, dist);
  return null;
}
function teeBaseline(par, yards){
  if (par === 3) return interp(FAIRWAY, yards);
  if (par === 4) return interp(TEE_PAR4, yards);
  if (par === 5) return interp(TEE_PAR5, yards);
  return 4.0;
}
function classify(idx, par, lieBefore, distBefore){
  if (idx === 0 && (par === 4 || par === 5)) return 'OTT';
  if (lieBefore === 'green') return 'PUTT';
  if (lieBefore !== 'tee' && distBefore < 30) return 'ARG';
  return 'APP';
}
function shotSG(s, par, idx){
  const before = s.lie_before === 'tee'
    ? teeBaseline(par, s.dist_before)
    : baseline(s.lie_before, s.dist_before);
  const after = s.lie_after === 'hole'
    ? 0
    : baseline(s.lie_after, s.dist_after);
  const sg = before - after - 1;
  const cat = classify(idx, par, s.lie_before, s.dist_before);
  return { sg, cat, before, after };
}
// Implied straight-line shot distance from before/after.
// Returns { value, unit } or null if undefined.
function impliedShotDistance(s){
  const beforeIsGreen = s.lie_before === 'green';
  const afterIsGreen = s.lie_after === 'hole' || s.lie_after === 'green';
  if (beforeIsGreen) {
    // Putt: stays in feet
    const ft = s.lie_after === 'hole' ? s.dist_before : Math.max(0, s.dist_before - s.dist_after);
    return ft > 0 ? { value: Math.round(ft), unit: 'ft' } : null;
  }
  if (s.lie_after === 'hole') {
    return s.dist_before > 0 ? { value: Math.round(s.dist_before), unit: 'y' } : null;
  }
  if (afterIsGreen) {
    // Approach: yards before, feet after. Convert.
    const y = Math.max(0, s.dist_before - s.dist_after / 3);
    return y > 0 ? { value: Math.round(y), unit: 'y' } : null;
  }
  // Same units — both yards
  const y = Math.max(0, s.dist_before - s.dist_after);
  return y > 0 ? { value: Math.round(y), unit: 'y' } : null;
}

// ==============================
// HANDICAP HELPERS
// ==============================
// Distribute handicap strokes across holes. If we have stroke index per hole,
// the lowest-numbered SI holes get a stroke first (then second loop for >18).
// Without SI, spread evenly so each hole gets handicap/18 strokes.
function strokesPerHole(holes, handicap){
  if (!holes || handicap == null || isNaN(handicap)) {
    return (holes || []).map(() => 0);
  }
  const n = holes.length;
  const hasSI = holes.every(h => typeof h.stroke_index === 'number');
  if (!hasSI) {
    const evenly = handicap / 18; // even split (covers 9 or 18 holes proportionally)
    return holes.map(() => evenly);
  }
  // SI-aware: indexed allocation. First pass: give one stroke to each hole with SI <= handicap.
  // Second pass for handicaps > 18, etc.
  const strokes = holes.map(() => 0);
  let remaining = Math.max(0, handicap);
  while (remaining > 0) {
    for (let pass = 1; pass <= n && remaining > 0; pass++) {
      const idx = holes.findIndex(h => h.stroke_index === pass);
      if (idx === -1) continue;
      const give = Math.min(1, remaining);
      strokes[idx] += give;
      remaining -= give;
    }
    if (remaining > 0 && remaining < 1) {
      // Fractional remainder — distribute proportionally to hardest hole
      const hardest = holes.findIndex(h => h.stroke_index === 1);
      if (hardest !== -1) strokes[hardest] += remaining;
      remaining = 0;
    }
  }
  return strokes;
}
// Net score for a hole — gross minus the handicap strokes given on that hole
function netHoleScore(grossStrokes, holeStrokes){
  return grossStrokes - holeStrokes;
}
// Net SG: scratch SG + handicap-strokes-on-that-hole / shots-on-that-hole
// Reasoning: scratch SG measures shots vs scratch baseline. A handicap golfer is
// "expected" to take handicap strokes more across the round. Distributing those
// strokes into per-shot credits gives a personal baseline.
function netShotSG(scratchSG, holeStrokes, totalShotsThisHole){
  if (!totalShotsThisHole) return scratchSG;
  const credit = (holeStrokes || 0) / totalShotsThisHole;
  return scratchSG + credit;
}
function isCompletedHole(h){
  return h?.shots && h.shots.some(s => s.lie_after === 'hole');
}
const SUGGEST_MIN_SHOTS = 20;
const SUGGEST_RECENT_WINDOW = 20;
// Approx yards SHORTER vs fairway/tee from each lie.
const LIE_PENALTY = { tee: 0, fairway: 0, rough: 8, sand: 18, recovery: 14, green: 0 };
// Low-loft clubs less affected by bad lies. Scale 0..1 (full to none).
function lieDampening(clubId){
  if (!clubId) return 1;
  if (['driver','3w','4w','5w','7w','9w','3h','hyb'].includes(clubId)) return 0.6;
  if (['4i','5i','6i'].includes(clubId)) return 0.85;
  return 1;
}

// Build per-club carry stats — last 20 shots, recency-weighted mean.
function buildClubStats(rounds){
  const allShots = [];
  Object.values(rounds || {}).forEach(r => {
    const ts = r.created_at ? new Date(r.created_at).getTime() : 0;
    (r.holes || []).forEach(h => {
      (h.shots || []).forEach((s, idx) => {
        if (!s.club || s.lie_before === 'green') return;
        const carry = impliedShotDistance(s);
        if (!carry || carry.unit !== 'y' || carry.value <= 0) return;
        allShots.push({ ...s, carry: carry.value, ts, idx });
      });
    });
  });
  allShots.sort((a, b) => (a.ts - b.ts) || (a.idx - b.idx));

  const byClub = {};
  allShots.forEach(s => {
    if (!byClub[s.club]) byClub[s.club] = [];
    byClub[s.club].push(s);
  });

  const stats = {};
  Object.entries(byClub).forEach(([clubId, shots]) => {
    const recent = shots.slice(-SUGGEST_RECENT_WINDOW);
    if (recent.length < SUGGEST_MIN_SHOTS) {
      stats[clubId] = { count: shots.length, qualified: false };
      return;
    }
    let wsum = 0, vsum = 0;
    recent.forEach((s, i) => {
      const w = i + 1;
      wsum += w; vsum += w * s.carry;
    });
    const mean = vsum / wsum;
    const m = recent.reduce((a, s) => a + s.carry, 0) / recent.length;
    const sq = recent.reduce((a, s) => a + (s.carry - m) ** 2, 0) / recent.length;
    const stdev = Math.sqrt(sq);
    stats[clubId] = {
      count: shots.length, qualified: true,
      mean, stdev,
      min: Math.min(...recent.map(s => s.carry)),
      max: Math.max(...recent.map(s => s.carry)),
    };
  });
  return stats;
}

// Pick best suggested club for a target distance from a given lie.
function suggestClub(stats, targetYards, lieBefore, bag){
  const bagSet = new Set(bag || []);
  const candidates = [];
  Object.entries(stats).forEach(([clubId, st]) => {
    if (!st.qualified) return;
    if (bagSet.size > 0 && !bagSet.has(clubId)) return;
    const expected = st.mean - (LIE_PENALTY[lieBefore] || 0) * lieDampening(clubId);
    candidates.push({ clubId, expected, mean: st.mean, stdev: st.stdev, min: st.min, max: st.max });
  });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => {
    const da = Math.abs(a.expected - targetYards);
    const db = Math.abs(b.expected - targetYards);
    if (Math.abs(da - db) < 0.5) {
      if (a.expected >= targetYards && b.expected < targetYards) return -1;
      if (b.expected >= targetYards && a.expected < targetYards) return 1;
    }
    return da - db;
  });
  return { ...candidates[0], candidates };
}
function holeTotals(hole, holeStrokes = 0){
  const t = { OTT:0, APP:0, ARG:0, PUTT:0, total:0, netTotal:0 };
  if (!hole?.shots) return t;
  const totalShots = hole.shots.length;
  hole.shots.forEach((s, i) => {
    const { sg, cat } = shotSG(s, hole.par, i);
    t[cat] += sg; t.total += sg;
    t.netTotal += netShotSG(sg, holeStrokes, totalShots);
  });
  return t;
}
function roundTotals(round, handicap = null){
  const t = { OTT:0, APP:0, ARG:0, PUTT:0, total:0, netTotal:0,
              score:0, netScore:0, par:0, holesCompleted:0,
              holesPlayedCount: round?.holes?.length || 0 };
  if (!round?.holes) return t;
  // Pre-compute strokes-per-hole using full course holes (so SI allocation respects course shape even if some holes are incomplete)
  const allHoles = round.holes;
  const strokesArr = handicap != null ? strokesPerHole(allHoles, handicap) : allHoles.map(() => 0);
  round.holes.forEach((h, idx) => {
    if (!isCompletedHole(h)) return;
    const holeStrokes = strokesArr[idx] || 0;
    const ht = holeTotals(h, holeStrokes);
    t.OTT += ht.OTT; t.APP += ht.APP; t.ARG += ht.ARG; t.PUTT += ht.PUTT;
    t.total += ht.total; t.netTotal += ht.netTotal;
    t.score += h.shots.length;
    t.netScore += netHoleScore(h.shots.length, holeStrokes);
    t.par += h.par; t.holesCompleted += 1;
  });
  return t;
}
function uid(p){ return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`; }
function fmt(n, dp=2){
  if (n === null || n === undefined || isNaN(n)) return '—';
  const s = n.toFixed(dp);
  return n > 0 ? '+' + s : s;
}
function fmtDate(iso){
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });
  } catch { return iso; }
}

// ==============================
// STORAGE
// ==============================
const DB_KEY = 'evensg:db:v1';
const initDB = () => ({ rounds: {}, courses: {}, activeRoundId: null, bag: [], settings: { clubSuggestionsEnabled: true, handicap: null } });

async function loadDB(){
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const loaded = JSON.parse(raw);
      return {
        bag: [], courses: {}, rounds: {}, activeRoundId: null,
        ...loaded,
        settings: { clubSuggestionsEnabled: true, handicap: null, ...(loaded.settings || {}) },
      };
    }
  } catch (e) {}
  return initDB();
}
async function saveDB(db){
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {}
}

// ==============================
// STYLES
// ==============================
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

    :root {
      --bg:        #f1ebdd;
      --bg-soft:   #ebe4d2;
      --surface:   #faf6ec;
      --surface-2: #f6efdd;
      --ink:       #142a20;
      --ink-soft:  #4f5f55;
      --ink-faint: #8b958d;
      --line:      #d6cbb2;
      --line-soft: #e6dfca;
      --pos:       #8a6a14;
      --neg:       #883a3e;
      --neutral:   #2d4f3c;
      --accent:    #c8511f;
    }

    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body, #root { margin:0; padding:0; }
    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: var(--bg);
      color: var(--ink);
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
    }
    .display { font-family: 'Fraunces', Georgia, serif; font-feature-settings: 'tnum' 1; letter-spacing: -0.01em; }
    .num     { font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1; }
    .grain {
      background-image:
        radial-gradient(rgba(20,42,32,0.025) 1px, transparent 1px),
        radial-gradient(rgba(20,42,32,0.018) 1px, transparent 1px);
      background-size: 3px 3px, 7px 7px;
      background-position: 0 0, 1px 2px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 14px;
    }
    .card-flat {
      background: var(--surface-2);
      border: 1px solid var(--line-soft);
      border-radius: 12px;
    }
    .btn {
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.01em;
      padding: 14px 18px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      transition: transform .12s ease, opacity .12s ease, background .12s ease;
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn:active { transform: scale(0.98); }
    .btn-primary { background: var(--ink); color: var(--surface); }
    .btn-primary:hover { background: var(--neutral); }
    .btn-ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
    .btn-ghost:hover { background: var(--surface-2); }
    .btn-soft { background: var(--surface-2); color: var(--ink); border: 1px solid var(--line); }
    .btn-danger { background: transparent; color: var(--neg); border: 1px solid var(--neg); }
    .btn-icon {
      width: 40px; height: 40px; padding: 0; border-radius: 10px;
      background: transparent; border: 1px solid var(--line);
      color: var(--ink); display:flex; align-items:center; justify-content:center;
      cursor: pointer;
    }
    .btn-icon:hover { background: var(--surface); }

    .input {
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      padding: 12px 14px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--surface);
      color: var(--ink);
      width: 100%;
      outline: none;
      transition: border-color .12s ease;
    }
    .input:focus { border-color: var(--ink); }
    .num-input {
      font-family: 'Fraunces', Georgia, serif;
      font-variant-numeric: tabular-nums;
      font-size: 32px;
      font-weight: 500;
      text-align: center;
      padding: 8px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--surface);
      color: var(--ink);
      width: 100%;
      outline: none;
      letter-spacing: -0.02em;
    }
    .num-input:focus { border-color: var(--ink); }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: var(--surface-2);
      color: var(--ink-soft);
      border: 1px solid var(--line-soft);
    }
    .lie-pill {
      padding: 14px 10px;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--ink);
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all .12s ease;
      text-align: center;
    }
    .lie-pill:active { transform: scale(0.97); }
    .lie-pill.active {
      background: var(--ink);
      color: var(--surface);
      border-color: var(--ink);
    }
    .par-pill {
      padding: 16px 0;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--ink);
      font-family: 'Fraunces', serif;
      font-weight: 500;
      font-size: 22px;
      cursor: pointer;
      flex: 1;
      text-align: center;
    }
    .par-pill.active {
      background: var(--ink); color: var(--surface); border-color: var(--ink);
    }

    .hole-tile {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: var(--surface);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 11px;
      color: var(--ink-soft);
      transition: all .15s ease;
      padding: 2px;
    }
    .hole-tile:active { transform: scale(0.95); }
    .hole-tile.current { background: var(--ink); color: var(--surface); border-color: var(--ink); }
    .hole-tile.done    { background: var(--surface-2); border-color: var(--line); }
    .hole-tile-num     { font-size: 10px; opacity: .7; line-height: 1; }
    .hole-tile-score   { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 600; line-height: 1.1; }

    .sg-pos { color: var(--pos); }
    .sg-neg { color: var(--neg); }
    .sg-zero { color: var(--ink-faint); }

    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, var(--line), transparent);
      border: 0;
      margin: 0;
    }

    /* Number-pad keypad styling */
    .keypad-key {
      font-family: 'Fraunces', serif;
      font-size: 26px;
      font-weight: 500;
      padding: 16px 0;
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--ink);
      border-radius: 12px;
      cursor: pointer;
      width: 100%;
    }
    .keypad-key:active { transform: scale(0.97); background: var(--surface-2); }
    .keypad-key.action { background: var(--surface-2); font-size: 18px; font-family: 'DM Sans'; }
    .keypad-key.confirm { background: var(--ink); color: var(--surface); border-color: var(--ink); }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn .25s ease both; }
  `}</style>
);

// ==============================
// PRIMITIVES
// ==============================
const SGNumber = ({ value, dp = 2, className = '', big = false }) => {
  if (value === null || value === undefined || isNaN(value)) {
    return <span className={`num sg-zero ${className}`}>—</span>;
  }
  const cls = value > 0.005 ? 'sg-pos' : value < -0.005 ? 'sg-neg' : 'sg-zero';
  const Tag = big ? 'span' : 'span';
  return <Tag className={`num ${cls} ${className}`}>{fmt(value, dp)}</Tag>;
};

const Header = ({ onBack, title, subtitle, right }) => (
  <div className="flex items-center px-5 pt-6 pb-4 gap-3">
    {onBack ? (
      <button className="btn-icon" onClick={onBack} aria-label="Back">
        <ChevronLeft size={20} />
      </button>
    ) : <div style={{width: 40}} />}
    <div className="flex-1 min-w-0">
      {subtitle && <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)'}}>{subtitle}</div>}
      <h1 className="display" style={{fontSize:26, fontWeight:500, margin:0, lineHeight:1.1, letterSpacing:'-0.02em'}}>{title}</h1>
    </div>
    {right || <div style={{width: 40}} />}
  </div>
);

const Section = ({ title, children, action }) => (
  <div className="px-5 mb-6">
    {title && (
      <div className="flex items-center justify-between mb-3">
        <div style={{fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-faint)', fontWeight:600}}>{title}</div>
        {action}
      </div>
    )}
    {children}
  </div>
);

// ==============================
// HOME
// ==============================
function HomeScreen({ db, onStart, onResume, onOpen, onStats, onCaddy, onBag, onSettings }){
  const rounds = Object.values(db.rounds).sort((a,b) => (b.date || '').localeCompare(a.date || ''));
  const completedRounds = rounds.filter(r => {
    const t = roundTotals(r);
    return t.holesCompleted >= 9;
  });
  const handicap = (db.settings || {}).handicap;
  const recentTotals = useMemo(() => {
    const last5 = completedRounds.slice(0, 5);
    if (last5.length === 0) return null;
    const agg = { OTT:0, APP:0, ARG:0, PUTT:0, total:0, netTotal:0, holes:0 };
    last5.forEach(r => {
      const t = roundTotals(r, handicap);
      agg.OTT += t.OTT; agg.APP += t.APP; agg.ARG += t.ARG; agg.PUTT += t.PUTT;
      agg.total += t.total; agg.netTotal += t.netTotal;
      agg.holes += t.holesCompleted;
    });
    if (agg.holes === 0) return null;
    const per18 = 18 / agg.holes;
    return {
      OTT: agg.OTT * per18, APP: agg.APP * per18, ARG: agg.ARG * per18,
      PUTT: agg.PUTT * per18, total: agg.total * per18,
      netTotal: agg.netTotal * per18,
      n: last5.length
    };
  }, [completedRounds, handicap]);

  const activeRound = db.activeRoundId ? db.rounds[db.activeRoundId] : null;
  const courses = Object.values(db.courses);

  return (
    <div className="fade-in">
      {/* Wordmark masthead */}
      <div className="px-5 pt-8 pb-4 grain" style={{borderBottom:'1px solid var(--line-soft)'}}>
        <div style={{fontSize:11, letterSpacing:'0.32em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:6, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span>Personal Strokes Gained</span>
          {handicap != null && (
            <span style={{
              fontFamily:'Fraunces, serif', fontSize:13, fontWeight:600,
              padding:'2px 8px', border:'1px solid var(--ink)', borderRadius:999,
              letterSpacing:'normal', textTransform:'none', color:'var(--ink)'
            }}>
              hcp {handicap > 0 ? '+' : ''}{handicap}
            </span>
          )}
        </div>
        <h1 className="display" style={{
          fontSize:60, fontWeight:600, margin:0, lineHeight:0.9, letterSpacing:'-0.04em',
          fontStyle:'italic', color:'var(--ink)'
        }}>UnderPar</h1>
        <div style={{fontSize:13, color:'var(--ink-soft)', marginTop:10, fontStyle:'italic'}}>
          {handicap != null
            ? 'Where your game stands against scratch — and against you.'
            : 'Where your game stands against scratch.'}
        </div>
      </div>

      {/* Active round banner */}
      {activeRound && (
        <div className="px-5 pt-5">
          <div className="card" style={{padding:18, borderColor:'var(--ink)', background:'var(--surface)'}}>
            <div className="flex items-center justify-between mb-3">
              <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', fontWeight:600}}>
                In progress
              </div>
              <Flag size={16} style={{color:'var(--ink-soft)'}}/>
            </div>
            <div className="display" style={{fontSize:22, fontWeight:500, lineHeight:1.1, marginBottom:4}}>
              {activeRound.course_name}
            </div>
            <div style={{fontSize:13, color:'var(--ink-soft)', marginBottom:14}}>
              {fmtDate(activeRound.date)} · {activeRound.holes.filter(h => h.shots?.some(s => s.lie_after==='hole')).length}/{activeRound.holes.length} holes
            </div>
            <button className="btn btn-primary" onClick={onResume}>
              Continue round <ArrowRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {/* Primary CTA */}
      {!activeRound && (
        <div className="px-5 pt-5">
          <button className="btn btn-primary" onClick={onStart} style={{padding:'18px'}}>
            <Plus size={18}/> Start a round
          </button>
        </div>
      )}

      {/* Recent form */}
      {recentTotals && (
        <Section title={`Last ${recentTotals.n} round${recentTotals.n>1?'s':''} · per 18`}>
          <div className="card" style={{padding:18}}>
            <div style={{display:'flex', alignItems:'baseline', gap:14, marginBottom:14, flexWrap:'wrap'}}>
              <div>
                <div className="display num" style={{fontSize:48, fontWeight:600, lineHeight:1, letterSpacing:'-0.03em'}}>
                  <SGNumber value={recentTotals.total} />
                </div>
                <div style={{fontSize:10, color:'var(--ink-faint)', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:4}}>vs Scratch</div>
              </div>
              {handicap != null && (
                <div style={{paddingLeft:14, borderLeft:'1px solid var(--line-soft)'}}>
                  <div className="display num" style={{fontSize:32, fontWeight:600, lineHeight:1, letterSpacing:'-0.02em', color: recentTotals.netTotal >= 0 ? 'var(--pos)' : 'var(--neg)'}}>
                    <SGNumber value={recentTotals.netTotal} />
                  </div>
                  <div style={{fontSize:10, color:'var(--ink-faint)', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:4}}>vs hcp {handicap > 0 ? '+' : ''}{handicap}</div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2" style={{paddingTop:14, borderTop:'1px solid var(--line-soft)'}}>
              {[['OTT', recentTotals.OTT], ['APP', recentTotals.APP], ['ARG', recentTotals.ARG], ['PUTT', recentTotals.PUTT]].map(([k,v]) => (
                <div key={k}>
                  <div style={{fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:4}}>{k}</div>
                  <div className="display num" style={{fontSize:20, fontWeight:500}}>
                    <SGNumber value={v} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Recent rounds */}
      {rounds.length > 0 && (
        <Section title="Round history" action={
          rounds.length > 5 ? <button className="chip" onClick={onStats} style={{cursor:'pointer'}}>All stats</button> : null
        }>
          <div className="space-y-2">
            {rounds.slice(0, 6).map(r => {
              const t = roundTotals(r, handicap);
              const complete = t.holesCompleted >= r.holes.length;
              const grossDiff = t.score - t.par;
              const netDiff = Math.round(t.netScore) - t.par;
              return (
                <button key={r.id} onClick={() => onOpen(r.id)} className="w-full text-left card-flat" style={{padding:14, cursor:'pointer'}}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="display" style={{fontSize:17, fontWeight:500, lineHeight:1.2, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                        {r.course_name}
                      </div>
                      <div style={{fontSize:12, color:'var(--ink-soft)'}}>
                        {fmtDate(r.date)} · {t.holesCompleted}/{r.holes.length} holes
                        {complete && t.score > 0 && (
                          <>
                            {' · '}{t.score} ({grossDiff > 0 ? '+' : ''}{grossDiff})
                            {handicap != null && (
                              <span style={{color:'var(--ink-faint)'}}>
                                {' · net '}{Math.round(t.netScore)} ({netDiff > 0 ? '+' : ''}{netDiff})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="display num" style={{fontSize:22, fontWeight:600, lineHeight:1, letterSpacing:'-0.02em'}}>
                        <SGNumber value={t.total} />
                      </div>
                      <div style={{fontSize:10, color:'var(--ink-faint)', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:2}}>SG</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {rounds.length === 0 && !activeRound && (
        <Section>
          <div className="card" style={{padding:24, textAlign:'center'}}>
            <Target size={28} style={{color:'var(--ink-faint)', margin:'0 auto 12px'}}/>
            <div className="display" style={{fontSize:18, fontWeight:500, marginBottom:6}}>Your first round awaits</div>
            <div style={{fontSize:13, color:'var(--ink-soft)', lineHeight:1.5}}>
              Track shots from approach onwards in detail, with simplified entry off the tee. Strokes gained against a scratch baseline.
            </div>
          </div>
        </Section>
      )}

      {/* Footer nav */}
      <Section>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button className="btn btn-ghost" onClick={onStats}>
            <BarChart3 size={16}/> Stats
          </button>
          <button className="btn btn-ghost" onClick={onBag}>
            <Briefcase size={16}/> My bag
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-ghost" onClick={onCaddy}>
            <Compass size={16}/> Greens
          </button>
          <button className="btn btn-ghost" onClick={onSettings}>
            <Settings size={16}/> Settings
          </button>
        </div>
      </Section>

      <div style={{height:32}} />
    </div>
  );
}

// ==============================
// NEW ROUND
// ==============================
function NewRoundScreen({ db, onCreate, onBack }){
  const userCourses = Object.values(db.courses).sort((a,b) => a.name.localeCompare(b.name));

  // Presets that haven't already been added by the user
  const usedPresetIds = new Set(Object.values(db.courses).map(c => c.source).filter(Boolean));
  const allAvailablePresets = COURSE_PRESETS.filter(p => !usedPresetIds.has(p.id));

  // Selection model: {type: 'preset'|'course'|'new', id?, name?}
  const [sel, setSel] = useState(() => {
    if (userCourses[0]) return { type: 'course', id: userCourses[0].id };
    return { type: 'new', name: '' };
  });
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [holesOverride, setHolesOverride] = useState(null); // null = follow template
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('IE'); // default to Ireland
  const [showLibrary, setShowLibrary] = useState(false);

  // Filter library by country + search term
  const filteredPresets = allAvailablePresets.filter(p => {
    if (countryFilter !== 'all' && p.country !== countryFilter) return false;
    if (searchTerm.trim() === '') return true;
    const q = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q);
  });

  // Country counts for the filter chips
  const countryCounts = {};
  allAvailablePresets.forEach(p => {
    countryCounts[p.country] = (countryCounts[p.country] || 0) + 1;
  });
  const orderedCountries = ['IE', 'GB', 'US', 'PT', 'ES'].filter(c => countryCounts[c]);

  // Resolve current selection to course details + hole template / par / yardage
  const resolved = (() => {
    if (sel.type === 'preset') {
      const p = COURSE_PRESETS.find(x => x.id === sel.id);
      return {
        name: p?.name || '',
        template: p?.holeTemplate || null,
        defaultPar: p?.par || null,
        defaultYardage: p?.yardage || null,
        defaultHoles: p?.holes || null,
      };
    }
    if (sel.type === 'course') {
      const c = db.courses[sel.id];
      return {
        name: c?.name || '',
        template: c?.holeTemplate || null,
        defaultPar: c?.par || null,
        defaultYardage: c?.yardage || null,
        defaultHoles: c?.holes || null,
      };
    }
    if (sel.type === 'new') {
      return { name: sel.name?.trim() || '', template: null, defaultPar: null, defaultYardage: null, defaultHoles: null };
    }
    return { name: '', template: null, defaultPar: null, defaultYardage: null, defaultHoles: null };
  })();

  const templateHoles = resolved.template?.length || 0;
  const naturalHoles = templateHoles || resolved.defaultHoles || 18;
  const holesCount = holesOverride !== null ? holesOverride : naturalHoles;
  const canStart = resolved.name.length > 0;

  const start = () => {
    if (!canStart) return;
    let cId, cName, cTemplate;
    let updatedCourses = db.courses;

    if (sel.type === 'preset') {
      const preset = COURSE_PRESETS.find(p => p.id === sel.id);
      cId = uid('course');
      cName = preset.name;
      cTemplate = preset.holeTemplate || null;
      updatedCourses = { ...db.courses, [cId]: {
        id: cId, name: preset.name, location: preset.location,
        par: preset.par, yardage: preset.yardage, holes: preset.holes,
        country: preset.country,
        holeTemplate: preset.holeTemplate, source: preset.id
      }};
    } else if (sel.type === 'new') {
      cId = uid('course');
      cName = sel.name.trim();
      cTemplate = null;
      updatedCourses = { ...db.courses, [cId]: { id: cId, name: cName } };
    } else {
      const c = db.courses[sel.id];
      cId = c.id; cName = c.name; cTemplate = c.holeTemplate || null;
    }

    let holes;
    if (cTemplate && (holesOverride === null || holesOverride === cTemplate.length)) {
      holes = cTemplate.map(t => ({ ...t, shots: [] }));
    } else if (cTemplate && holesOverride === 9) {
      holes = cTemplate.slice(0, 9).map(t => ({ ...t, shots: [] }));
    } else {
      // No hole-by-hole template — estimate par/yardage from course average
      const avgYardage = resolved.defaultYardage && resolved.defaultHoles
        ? Math.round(resolved.defaultYardage / resolved.defaultHoles)
        : 380;
      const avgPar = resolved.defaultPar && resolved.defaultHoles
        ? Math.round((resolved.defaultPar / resolved.defaultHoles) * 10) / 10  // e.g. 4.0 or 3.9
        : 4;
      holes = Array.from({length: holesCount}, (_, i) => ({
        hole_num: i+1, par: Math.round(avgPar), yardage: avgYardage, shots: []
      }));
    }

    const round = {
      id: uid('round'),
      date,
      course_id: cId,
      course_name: cName,
      holes_played: holes.length,
      holes,
      created_at: new Date().toISOString(),
    };
    onCreate(round, updatedCourses);
  };

  const isPresetSel = (id) => sel.type === 'preset' && sel.id === id;
  const isCourseSel = (id) => sel.type === 'course' && sel.id === id;

  return (
    <div className="fade-in">
      <Header onBack={onBack} title="New round" subtitle="Setup" />

      {/* User courses (if any) */}
      {userCourses.length > 0 && (
        <Section title="Your courses">
          <div className="space-y-2">
            {userCourses.map(c => (
              <button key={c.id}
                onClick={() => setSel({ type: 'course', id: c.id })}
                className="lie-pill w-full"
                style={{
                  textAlign:'left', padding:'14px 16px',
                  background: isCourseSel(c.id) ? 'var(--ink)' : 'var(--surface)',
                  color: isCourseSel(c.id) ? 'var(--surface)' : 'var(--ink)',
                  borderColor: isCourseSel(c.id) ? 'var(--ink)' : 'var(--line)',
                }}>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <MapPin size={14} style={{opacity:0.7, flexShrink:0}}/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:500}}>{c.name}</div>
                    {c.holeTemplate && (
                      <div style={{fontSize:11, opacity:0.7, marginTop:1}}>
                        Pre-loaded · {c.holeTemplate.length} holes
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Course library — collapsible */}
      {allAvailablePresets.length > 0 && (
        <Section title={`Course library · ${allAvailablePresets.length} courses`} action={
          <button onClick={() => setShowLibrary(!showLibrary)} className="chip" style={{cursor:'pointer'}}>
            {showLibrary ? 'Hide' : 'Browse'}
          </button>
        }>
          {showLibrary && (
            <>
              {/* Search */}
              <input
                className="input mb-3"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              {/* Country filter chips */}
              <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:12}}>
                <button onClick={() => setCountryFilter('all')}
                  className="chip"
                  style={{
                    cursor:'pointer',
                    background: countryFilter === 'all' ? 'var(--ink)' : 'var(--surface-2)',
                    color: countryFilter === 'all' ? 'var(--surface)' : 'var(--ink-soft)',
                    borderColor: countryFilter === 'all' ? 'var(--ink)' : 'var(--line-soft)',
                  }}>
                  All · {allAvailablePresets.length}
                </button>
                {orderedCountries.map(cc => (
                  <button key={cc} onClick={() => setCountryFilter(cc)}
                    className="chip"
                    style={{
                      cursor:'pointer',
                      background: countryFilter === cc ? 'var(--ink)' : 'var(--surface-2)',
                      color: countryFilter === cc ? 'var(--surface)' : 'var(--ink-soft)',
                      borderColor: countryFilter === cc ? 'var(--ink)' : 'var(--line-soft)',
                    }}>
                    {COUNTRY_LABELS[cc]} · {countryCounts[cc]}
                  </button>
                ))}
              </div>

              {/* Filtered results */}
              <div className="space-y-2" style={{maxHeight:380, overflowY:'auto', paddingRight:2}}>
                {filteredPresets.length === 0 ? (
                  <div className="card-flat" style={{padding:14, textAlign:'center', fontSize:13, color:'var(--ink-soft)'}}>
                    No courses match. Add it manually below.
                  </div>
                ) : filteredPresets.map(p => (
                  <button key={p.id}
                    onClick={() => setSel({ type: 'preset', id: p.id })}
                    className="lie-pill w-full"
                    style={{
                      textAlign:'left', padding:'12px 14px',
                      background: isPresetSel(p.id) ? 'var(--ink)' : 'var(--surface)',
                      color: isPresetSel(p.id) ? 'var(--surface)' : 'var(--ink)',
                      borderColor: isPresetSel(p.id) ? 'var(--ink)' : 'var(--line)',
                    }}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      {p.holeTemplate
                        ? <BookOpen size={14} style={{opacity:0.7, flexShrink:0}}/>
                        : <MapPin size={14} style={{opacity:0.7, flexShrink:0}}/>
                      }
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontWeight:500, fontSize:14, lineHeight:1.2}}>{p.name}</div>
                        <div style={{fontSize:11, opacity:0.7, marginTop:2}}>
                          {p.location} · Par {p.par} · {p.yardage}y · {p.holes}H
                          {p.holeTemplate && <span style={{marginLeft:6, fontStyle:'italic'}}>· full scorecard</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Compact selected display when library hidden */}
          {!showLibrary && sel.type === 'preset' && (() => {
            const p = COURSE_PRESETS.find(x => x.id === sel.id);
            return p ? (
              <div className="card-flat" style={{padding:14, display:'flex', alignItems:'center', gap:10}}>
                <BookOpen size={14} style={{opacity:0.7, color:'var(--ink-soft)'}}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:500, fontSize:14}}>{p.name}</div>
                  <div style={{fontSize:11, color:'var(--ink-faint)'}}>{p.location} · Par {p.par} · {p.yardage}y</div>
                </div>
              </div>
            ) : null;
          })()}
        </Section>
      )}

      <Section title="Or add new course">
        <input
          className="input"
          placeholder="Course name"
          value={sel.type === 'new' ? sel.name : ''}
          onChange={e => setSel({ type: 'new', name: e.target.value })}
        />
      </Section>

      <Section title="Holes">
        <div className="grid grid-cols-2 gap-2">
          {[9, 18].map(n => {
            const active = holesCount === n;
            return (
              <button key={n}
                className="par-pill"
                style={{
                  background: active ? 'var(--ink)' : 'var(--surface)',
                  color: active ? 'var(--surface)' : 'var(--ink)',
                  borderColor: active ? 'var(--ink)' : 'var(--line)',
                }}
                onClick={() => setHolesOverride(n)}>
                {n}
              </button>
            );
          })}
        </div>
        {resolved.template ? (
          <div style={{fontSize:11, color:'var(--ink-faint)', marginTop:8, fontStyle:'italic'}}>
            Hole-by-hole pre-filled from {resolved.name} scorecard
          </div>
        ) : sel.type === 'preset' && resolved.defaultPar ? (
          <div style={{fontSize:11, color:'var(--ink-faint)', marginTop:8, fontStyle:'italic'}}>
            Course total known · enter par/yardage per hole during the round. Saved as a template afterwards.
          </div>
        ) : null}
      </Section>

      <Section title="Date">
        <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
      </Section>

      <Section>
        <button className="btn btn-primary" onClick={start} disabled={!canStart} style={{opacity: canStart ? 1 : 0.4}}>
          Begin round <ArrowRight size={16}/>
        </button>
      </Section>
      <div style={{height:32}} />
    </div>
  );
}

// ==============================
// ACTIVE ROUND
// ==============================
function ActiveRoundScreen({ round, onUpdateHole, onFinish, onAbandon, onBack, bag, onClubUsed, clubStats, suggestionsEnabled, handicap }){
  const [holeIdx, setHoleIdx] = useState(() => {
    const i = round.holes.findIndex(h => !h.shots?.some(s => s.lie_after === 'hole'));
    return i === -1 ? 0 : i;
  });
  const [showFinish, setShowFinish] = useState(false);

  const hole = round.holes[holeIdx];
  const totals = roundTotals(round, handicap);
  const allDone = round.holes.every(h => h.shots?.some(s => s.lie_after === 'hole'));
  const strokesArr = handicap != null ? strokesPerHole(round.holes, handicap) : round.holes.map(() => 0);

  const updateHole = (patch) => {
    const next = round.holes.map((h, i) => i === holeIdx ? { ...h, ...patch } : h);
    onUpdateHole(next);
  };

  return (
    <div className="fade-in">
      <Header
        onBack={onBack}
        title={round.course_name}
        subtitle={fmtDate(round.date)}
        right={
          <button className="btn-icon" onClick={() => setShowFinish(true)} aria-label="Finish round">
            <Check size={18}/>
          </button>
        }
      />

      {/* Round running totals */}
      <div className="px-5 pb-3">
        <div className="card-flat" style={{padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-faint)'}}>
            Through {totals.holesCompleted}
          </div>
          <div style={{display:'flex', alignItems:'baseline', gap:12}}>
            <div className="display num" style={{fontSize:18, fontWeight:600, letterSpacing:'-0.02em'}}>
              <SGNumber value={totals.total}/>
              <span style={{fontSize:11, color:'var(--ink-faint)', marginLeft:6, fontFamily:'DM Sans', letterSpacing:'0.1em'}}>SCRATCH</span>
            </div>
            {handicap != null && (
              <div className="display num" style={{fontSize:16, fontWeight:600, letterSpacing:'-0.02em', color: totals.netTotal >= 0 ? 'var(--pos)' : 'var(--neg)'}}>
                <SGNumber value={totals.netTotal}/>
                <span style={{fontSize:10, color:'var(--ink-faint)', marginLeft:4, fontFamily:'DM Sans', letterSpacing:'0.1em'}}>NET</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scorecard strip */}
      <div className="px-5 pb-4">
        <div className={`grid gap-1`} style={{gridTemplateColumns: `repeat(${Math.min(round.holes.length, 9)}, 1fr)`}}>
          {round.holes.slice(0, 9).map((h, i) => {
            const done = h.shots?.some(s => s.lie_after === 'hole');
            const score = done ? h.shots.length : null;
            const ht = done ? holeTotals(h) : null;
            return (
              <button key={i}
                onClick={() => setHoleIdx(i)}
                className={`hole-tile ${holeIdx === i ? 'current' : done ? 'done' : ''}`}>
                <div className="hole-tile-num">{h.hole_num}</div>
                {score ? (
                  <div className="hole-tile-score">{score}</div>
                ) : (
                  <div style={{fontSize:14, opacity:0.5}}>·</div>
                )}
                {ht && (
                  <div style={{fontSize:9, marginTop:1, opacity:0.85, fontVariantNumeric:'tabular-nums'}}>
                    {fmt(ht.total, 1)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {round.holes.length > 9 && (
          <div className="grid gap-1 mt-1" style={{gridTemplateColumns: `repeat(9, 1fr)`}}>
            {round.holes.slice(9, 18).map((h, i) => {
              const idx = i + 9;
              const done = h.shots?.some(s => s.lie_after === 'hole');
              const score = done ? h.shots.length : null;
              const ht = done ? holeTotals(h) : null;
              return (
                <button key={idx}
                  onClick={() => setHoleIdx(idx)}
                  className={`hole-tile ${holeIdx === idx ? 'current' : done ? 'done' : ''}`}>
                  <div className="hole-tile-num">{h.hole_num}</div>
                  {score ? (
                    <div className="hole-tile-score">{score}</div>
                  ) : (
                    <div style={{fontSize:14, opacity:0.5}}>·</div>
                  )}
                  {ht && (
                    <div style={{fontSize:9, marginTop:1, opacity:0.85, fontVariantNumeric:'tabular-nums'}}>
                      {fmt(ht.total, 1)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Current hole */}
      <HoleEntry hole={hole} onUpdate={updateHole}
        bag={bag} onClubUsed={onClubUsed}
        clubStats={clubStats} suggestionsEnabled={suggestionsEnabled}
        onPrev={holeIdx > 0 ? () => setHoleIdx(holeIdx - 1) : null}
        onNext={holeIdx < round.holes.length - 1 ? () => setHoleIdx(holeIdx + 1) : null}
      />

      {showFinish && (
        <Modal onClose={() => setShowFinish(false)}>
          <div style={{padding:'8px 4px'}}>
            <div className="display" style={{fontSize:24, fontWeight:500, marginBottom:6}}>
              {allDone ? 'Save round?' : 'Finish round early?'}
            </div>
            <div style={{fontSize:14, color:'var(--ink-soft)', marginBottom:18, lineHeight:1.5}}>
              {allDone
                ? `${round.holes.length} holes complete. SG total ${fmt(totals.total)}.`
                : `${totals.holesCompleted}/${round.holes.length} holes complete. Incomplete holes won't count.`}
            </div>
            <div className="space-y-2">
              <button className="btn btn-primary" onClick={() => onFinish()}>
                Save round
              </button>
              <button className="btn btn-ghost" onClick={() => setShowFinish(false)}>
                Keep playing
              </button>
              <button className="btn btn-danger" onClick={() => { if (confirm('Delete this round?')) onAbandon(); }}>
                Discard round
              </button>
            </div>
          </div>
        </Modal>
      )}
      <div style={{height:32}} />
    </div>
  );
}

// ==============================
// HOLE ENTRY
// ==============================
function HoleEntry({ hole, onUpdate, onPrev, onNext, bag, onClubUsed, clubStats, suggestionsEnabled }){
  const [showShotForm, setShowShotForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null);

  const shots = hole.shots || [];
  const last = shots[shots.length - 1];
  const holeDone = last?.lie_after === 'hole';
  const totals = holeTotals(hole);

  // Determine starting position for next shot
  const nextLieBefore = shots.length === 0 ? 'tee' : last.lie_after;
  const nextDistBefore = shots.length === 0 ? hole.yardage : last.dist_after;

  const setPar = (p) => {
    const defaults = { 3: 165, 4: 380, 5: 510 };
    onUpdate({ par: p, yardage: hole.yardage || defaults[p] });
  };
  const setYardage = (y) => onUpdate({ yardage: y });

  const addShot = (s) => {
    const newShots = editIdx !== null
      ? shots.map((existing, i) => i === editIdx ? s : i > editIdx ? null : existing).filter(Boolean)
      : [...shots, s];
    onUpdate({ shots: newShots });
    if (s.club && onClubUsed) onClubUsed(s.club);
    setShowShotForm(false);
    setEditIdx(null);
  };

  const deleteShot = (i) => {
    onUpdate({ shots: shots.slice(0, i) });
  };

  return (
    <div className="px-5">
      {/* Hole header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button className="btn-icon" onClick={onPrev} disabled={!onPrev} style={{opacity: onPrev ? 1 : 0.3}}>
            <ChevronLeft size={18}/>
          </button>
          <div>
            <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)'}}>
              {hole.name ? `Hole · ${hole.name}` : 'Hole'}
            </div>
            <div className="display" style={{fontSize:36, fontWeight:600, lineHeight:1, letterSpacing:'-0.03em'}}>{hole.hole_num}</div>
          </div>
        </div>
        <button className="btn-icon" onClick={onNext} disabled={!onNext} style={{opacity: onNext ? 1 : 0.3}}>
          <ChevronRight size={18}/>
        </button>
      </div>

      {/* Par + yardage controls */}
      <div className="card-flat mb-4" style={{padding:14}}>
        <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:8}}>Par · Yardage</div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[3,4,5].map(p => (
            <button key={p}
              onClick={() => setPar(p)}
              className="par-pill"
              style={{
                background: hole.par === p ? 'var(--ink)' : 'var(--surface)',
                color: hole.par === p ? 'var(--surface)' : 'var(--ink)',
                borderColor: hole.par === p ? 'var(--ink)' : 'var(--line)',
              }}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="input num"
            type="number"
            value={hole.yardage}
            onChange={e => setYardage(parseInt(e.target.value) || 0)}
            style={{textAlign:'center', fontFamily:'Fraunces, serif', fontSize:18}}
          />
          <span style={{fontSize:13, color:'var(--ink-soft)'}}>yds</span>
        </div>
      </div>

      {/* Shots stack */}
      <div className="mb-4">
        <div style={{fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-faint)', fontWeight:600, marginBottom:10}}>
          Shots · {totals.total !== 0 ? <SGNumber value={totals.total} dp={2}/> : <span className="num sg-zero">±0.00</span>} <span style={{color:'var(--ink-faint)'}}>SG</span>
        </div>
        {shots.length === 0 ? (
          <div className="card" style={{padding:18, textAlign:'center'}}>
            <div style={{fontSize:13, color:'var(--ink-soft)', marginBottom:14}}>
              {hole.par === 3 ? 'Tee shot from ' : 'Tee shot · '}
              <span className="num" style={{fontWeight:600, color:'var(--ink)'}}>{hole.yardage}y</span>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditIdx(null); setShowShotForm(true); }}>
              <Plus size={16}/> Add tee shot
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {shots.map((s, i) => {
              const { sg, cat } = shotSG(s, hole.par, i);
              const distUnit = s.lie_before === 'green' ? 'ft' : 'y';
              const afterDistUnit = s.lie_after === 'green' || s.lie_after === 'hole' ? 'ft' : 'y';
              const carry = impliedShotDistance(s);
              return (
                <div key={i} className="card" style={{padding:14}}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1" style={{flexWrap:'wrap'}}>
                        <span className="display" style={{fontSize:14, fontWeight:600, color:'var(--ink-soft)'}}>{i+1}.</span>
                        <span className="chip" style={{textTransform:'uppercase'}}>{cat}</span>
                        {s.club && (
                          <span className="chip" style={{
                            textTransform:'none', background:'var(--surface)',
                            borderColor:'var(--ink)', color:'var(--ink)', fontWeight:600,
                            letterSpacing:'0.02em', fontFamily:'Fraunces, serif', fontSize:13, padding:'2px 8px'
                          }}>
                            {CLUB_LABEL[s.club] || s.club}
                          </span>
                        )}
                        {carry && (
                          <span className="num" style={{
                            fontSize:12, fontWeight:600, color:'var(--ink-soft)',
                            fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em'
                          }}>
                            ≈ {carry.value}{carry.unit}
                          </span>
                        )}
                      </div>
                      <div style={{fontSize:14, color:'var(--ink)', lineHeight:1.5}}>
                        <span className="num" style={{fontWeight:600}}>{s.dist_before}{distUnit}</span>
                        {' '}from {LIE_LABEL[s.lie_before].toLowerCase()}
                        <ArrowRight size={12} style={{display:'inline', margin:'0 6px', color:'var(--ink-faint)'}}/>
                        {s.lie_after === 'hole' ? (
                          <span style={{fontWeight:600, color:'var(--neutral)'}}>holed</span>
                        ) : (
                          <>
                            <span className="num" style={{fontWeight:600}}>{s.dist_after}{afterDistUnit}</span>
                            {' '}{LIE_LABEL[s.lie_after].toLowerCase()}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right" style={{flexShrink:0}}>
                      <div className="display num" style={{fontSize:18, fontWeight:600, lineHeight:1}}>
                        <SGNumber value={sg}/>
                      </div>
                      <div style={{display:'flex', gap:4, marginTop:4}}>
                        <button className="btn-icon" style={{width:28, height:28}}
                          onClick={() => { setEditIdx(i); setShowShotForm(true); }}>
                          <Edit3 size={12}/>
                        </button>
                        <button className="btn-icon" style={{width:28, height:28, color:'var(--neg)', borderColor:'var(--line)'}}
                          onClick={() => { if (confirm(`Delete shot ${i+1}? Subsequent shots will also be removed.`)) deleteShot(i); }}>
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {!holeDone && (
              <button className="btn btn-primary" onClick={() => { setEditIdx(null); setShowShotForm(true); }}>
                <Plus size={16}/> Add shot · {LIE_LABEL[nextLieBefore].toLowerCase()}
                {' · '}<span className="num">{nextDistBefore}{nextLieBefore==='green'?'ft':'y'}</span>
              </button>
            )}
            {holeDone && (
              <div className="card-flat" style={{padding:14, textAlign:'center'}}>
                <div className="display" style={{fontSize:18, fontWeight:600, marginBottom:4}}>
                  {shots.length} {shots.length === hole.par ? '· par' : (shots.length - hole.par > 0 ? `· +${shots.length - hole.par}` : `· ${shots.length - hole.par}`)}
                </div>
                <div style={{fontSize:13, color:'var(--ink-soft)'}}>
                  Hole complete · <SGNumber value={totals.total}/> SG
                </div>
                {onNext && (
                  <button className="btn btn-soft mt-3" onClick={onNext}>
                    Next hole <ChevronRight size={14}/>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showShotForm && (
        <ShotForm
          par={hole.par}
          yardage={hole.yardage}
          shotIdx={editIdx !== null ? editIdx : shots.length}
          existing={editIdx !== null ? shots[editIdx] : null}
          lieBefore={editIdx !== null ? shots[editIdx].lie_before : nextLieBefore}
          distBefore={editIdx !== null ? shots[editIdx].dist_before : nextDistBefore}
          bag={bag || []}
          clubStats={clubStats}
          suggestionsEnabled={suggestionsEnabled}
          onSubmit={addShot}
          onCancel={() => { setShowShotForm(false); setEditIdx(null); }}
        />
      )}
    </div>
  );
}

// ==============================
// SHOT FORM (modal)
// ==============================
function ShotForm({ par, yardage, shotIdx, existing, lieBefore, distBefore, bag, clubStats, suggestionsEnabled, onSubmit, onCancel }){
  const isPutt = lieBefore === 'green';
  const [lieAfter, setLieAfter] = useState(existing?.lie_after || (isPutt ? 'hole' : 'fairway'));
  const [distAfterStr, setDistAfterStr] = useState(
    existing?.dist_after?.toString() || (isPutt ? '0' : '120')
  );
  const [club, setClub] = useState(existing?.club || '');
  const [showAllClubs, setShowAllClubs] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  // Compute suggested club (only when relevant: not putting, no club picked yet, suggestions on)
  const suggestion = useMemo(() => {
    if (isPutt || club || suggestionDismissed || !suggestionsEnabled || !clubStats) return null;
    if (!distBefore || distBefore <= 0) return null;
    return suggestClub(clubStats, distBefore, lieBefore, bag);
  }, [isPutt, club, suggestionDismissed, suggestionsEnabled, clubStats, distBefore, lieBefore, bag]);

  const bagSet = new Set(bag || []);
  // If user has a bag, filter to bag clubs unless they expand. Always show selected club even if not in bag.
  const useBag = bagSet.size > 0 && !showAllClubs;
  const visibleClubs = useBag
    ? DEFAULT_BAG.filter(c => bagSet.has(c.id) || c.id === club)
    : DEFAULT_BAG;

  const distAfter = parseInt(distAfterStr) || 0;
  const isHoled = lieAfter === 'hole' || (isPutt && distAfter === 0);

  const candidate = {
    lie_before: lieBefore,
    dist_before: distBefore,
    lie_after: isHoled ? 'hole' : lieAfter,
    dist_after: isHoled ? 0 : distAfter,
  };

  const sg = useMemo(() => {
    try {
      const r = shotSG(candidate, par, shotIdx);
      return r.sg;
    } catch { return null; }
  }, [candidate, par, shotIdx]);

  const submit = () => {
    onSubmit({
      lie_before: lieBefore,
      dist_before: distBefore,
      lie_after: isHoled ? 'hole' : lieAfter,
      dist_after: isHoled ? 0 : distAfter,
      ...(isPutt ? {} : { club: club || undefined }),
    });
  };

  // Filter lie options for putts (only green or hole)
  const visibleLies = isPutt
    ? LIE_PICKER.filter(l => l.id === 'green' || l.id === 'hole')
    : LIE_PICKER;

  return (
    <Modal onClose={onCancel}>
      <div>
        <div className="flex items-center justify-between mb-1">
          <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', fontWeight:600}}>
            Shot {shotIdx + 1} {isPutt ? '· Putt' : ''}
          </div>
          <button className="btn-icon" onClick={onCancel} style={{width:32, height:32}}>
            <X size={16}/>
          </button>
        </div>
        <div className="display" style={{fontSize:20, fontWeight:500, marginBottom:18, lineHeight:1.2}}>
          {isPutt ? 'Putting' : 'From'} <span className="num" style={{fontWeight:600}}>{distBefore}{isPutt?'ft':'y'}</span> · {LIE_LABEL[lieBefore].toLowerCase()}
        </div>

        {/* Club suggestion banner */}
        {suggestion && (() => {
          const meta = DEFAULT_BAG.find(c => c.id === suggestion.clubId);
          const expectedRounded = Math.round(suggestion.expected);
          const diff = expectedRounded - distBefore;
          const diffLabel = diff > 1 ? `${diff}y over` : diff < -1 ? `${Math.abs(diff)}y short` : 'on the number';
          const lieAdj = (LIE_PENALTY[lieBefore] || 0) > 0;
          return (
            <div className="card-flat fade-in" style={{
              padding:'12px 14px', marginBottom:14,
              background:'var(--surface)',
              borderColor:'var(--ink)',
              borderWidth:1, borderStyle:'solid',
              borderRadius:12,
              display:'flex', alignItems:'center', gap:12
            }}>
              <div style={{
                fontFamily:'Fraunces, serif', fontSize:22, fontWeight:600,
                background:'var(--ink)', color:'var(--surface)',
                width:48, height:48, borderRadius:10,
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0, letterSpacing:'-0.02em'
              }}>
                {meta?.label || suggestion.clubId}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-faint)', fontWeight:600, marginBottom:2}}>
                  Suggested
                </div>
                <div className="display" style={{fontSize:15, fontWeight:600, lineHeight:1.2}}>
                  {meta?.full || suggestion.clubId}
                </div>
                <div style={{fontSize:11, color:'var(--ink-soft)', marginTop:2, fontVariantNumeric:'tabular-nums'}}>
                  Avg <strong>{Math.round(suggestion.mean)}y</strong>
                  {lieAdj && <span> · ~{expectedRounded}y from {LIE_LABEL[lieBefore].toLowerCase()}</span>}
                  <span> · {diffLabel}</span>
                </div>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:4, flexShrink:0}}>
                <button
                  onClick={() => setClub(suggestion.clubId)}
                  style={{
                    background:'var(--ink)', color:'var(--surface)', border:'none',
                    padding:'8px 12px', borderRadius:8, fontSize:12, fontWeight:600,
                    cursor:'pointer', letterSpacing:'0.04em', textTransform:'uppercase'
                  }}>
                  Use
                </button>
                <button
                  onClick={() => setSuggestionDismissed(true)}
                  aria-label="Dismiss suggestion"
                  style={{
                    background:'transparent', border:'1px solid var(--line)',
                    padding:'4px 0', borderRadius:8, fontSize:11, color:'var(--ink-faint)',
                    cursor:'pointer', letterSpacing:'0.06em'
                  }}>
                  ✕
                </button>
              </div>
            </div>
          );
        })()}

        {/* Club picker (skip for putts) */}
        {!isPutt && (
          <div className="mb-4">
            <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span>Club {useBag && <span style={{opacity:0.7, marginLeft:4, textTransform:'none', letterSpacing:'normal', fontStyle:'italic'}}>· my bag</span>}</span>
              {club && (
                <button onClick={() => setClub('')}
                  style={{fontSize:11, color:'var(--ink-faint)', background:'transparent', border:'none', cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.1em', padding:0}}>
                  Clear
                </button>
              )}
            </div>
            {CLUB_GROUPS.map(group => {
              const clubs = visibleClubs.filter(c => c.group === group);
              if (clubs.length === 0) return null;
              return (
                <div key={group} style={{marginBottom:8}}>
                  <div style={{fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:4, opacity:0.7}}>
                    {group}
                  </div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                    {clubs.map(c => (
                      <button key={c.id}
                        onClick={() => setClub(c.id === club ? '' : c.id)}
                        className="lie-pill"
                        style={{
                          flex:'0 0 auto',
                          padding:'8px 12px',
                          fontSize:13,
                          fontWeight:500,
                          minWidth:44,
                          background: club === c.id ? 'var(--ink)' : 'var(--surface)',
                          color: club === c.id ? 'var(--surface)' : 'var(--ink)',
                          borderColor: club === c.id ? 'var(--ink)' : 'var(--line)',
                        }}
                        aria-label={c.full}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {bagSet.size > 0 && (
              <button onClick={() => setShowAllClubs(!showAllClubs)}
                style={{
                  fontSize:11, color:'var(--ink-faint)', background:'transparent',
                  border:'none', cursor:'pointer', letterSpacing:'0.1em',
                  textTransform:'uppercase', padding:'4px 0', marginTop:4
                }}>
                {showAllClubs ? '— Show only my bag' : '+ Show all clubs'}
              </button>
            )}
          </div>
        )}

        {/* Lie after picker */}
        {!isPutt && (
          <div className="mb-4">
            <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:8}}>
              Result
            </div>
            <div className="grid grid-cols-3 gap-2">
              {visibleLies.map(l => (
                <button key={l.id}
                  onClick={() => setLieAfter(l.id)}
                  className={`lie-pill ${lieAfter === l.id ? 'active' : ''}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Distance after */}
        {!isHoled && (
          <div className="mb-4">
            <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:8}}>
              Distance to hole {(lieAfter === 'green' || isPutt) ? '(feet)' : '(yards)'}
            </div>
            <div className="num-input-wrap">
              <input
                type="number"
                value={distAfterStr}
                onChange={e => setDistAfterStr(e.target.value)}
                className="num-input"
                inputMode="numeric"
              />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(lieAfter === 'green' || isPutt
                  ? [-10, -3, +3, +10]
                  : [-50, -10, +10, +50]
                ).map(d => (
                  <button key={d}
                    onClick={() => setDistAfterStr(String(Math.max(0, distAfter + d)))}
                    className="btn btn-soft" style={{padding:'10px 0', fontSize:13}}>
                    {d > 0 ? `+${d}` : d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isPutt && (
          <div className="mb-4">
            <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:8}}>
              Result
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setLieAfter('hole'); setDistAfterStr('0'); }}
                className={`lie-pill ${isHoled ? 'active' : ''}`}>
                Holed
              </button>
              <button
                onClick={() => { setLieAfter('green'); if (isHoled) setDistAfterStr('3'); }}
                className={`lie-pill ${!isHoled ? 'active' : ''}`}>
                Missed (ft remain)
              </button>
            </div>
          </div>
        )}

        {/* Shot summary — implied distance + SG */}
        {(() => {
          // Compute implied shot distance with proper unit handling
          // Putting: stays in feet. Approach to green: yards → feet conversion.
          const beforeIsGreen = isPutt;
          const afterIsGreen = isHoled || (lieAfter === 'green');
          let shotDistY = null;
          let shotDistFt = null;
          let approxNote = null;

          if (beforeIsGreen) {
            // Putt: dist_before is feet. Holed = full putt; missed = before - after (feet)
            shotDistFt = isHoled ? distBefore : Math.max(0, distBefore - distAfter);
          } else if (afterIsGreen && !isHoled) {
            // Approach to green: before in yards, after in feet. Convert.
            const afterY = distAfter / 3;
            shotDistY = Math.max(0, distBefore - afterY);
            approxNote = 'straight-line';
          } else if (isHoled) {
            // Holed from off the green — shot carried full distance in yards
            shotDistY = distBefore;
          } else {
            // Same-unit (both yards): tee/fairway/rough/sand → fairway/rough/sand/recovery
            shotDistY = Math.max(0, distBefore - distAfter);
            approxNote = 'straight-line';
          }

          const showShot = (shotDistY !== null && shotDistY > 0) || (shotDistFt !== null && shotDistFt > 0);

          return (
            <div className="mb-4" style={{display:'grid', gridTemplateColumns: showShot ? '1fr 1fr' : '1fr', gap:8}}>
              {showShot && (
                <div className="card-flat" style={{padding:14, textAlign:'center'}}>
                  <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:4}}>
                    Shot distance
                  </div>
                  <div className="display num" style={{fontSize:32, fontWeight:600, lineHeight:1, letterSpacing:'-0.02em'}}>
                    {shotDistY !== null ? Math.round(shotDistY) : Math.round(shotDistFt)}
                    <span style={{fontSize:14, color:'var(--ink-faint)', fontWeight:400, marginLeft:3}}>
                      {shotDistY !== null ? 'y' : 'ft'}
                    </span>
                  </div>
                  {approxNote && (
                    <div style={{fontSize:10, color:'var(--ink-faint)', marginTop:4, fontStyle:'italic'}}>
                      ≈ {approxNote}
                    </div>
                  )}
                </div>
              )}
              <div className="card-flat" style={{padding:14, textAlign:'center'}}>
                <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:4}}>
                  Strokes gained
                </div>
                <div className="display num" style={{fontSize:32, fontWeight:600, lineHeight:1, letterSpacing:'-0.02em'}}>
                  <SGNumber value={sg}/>
                </div>
              </div>
            </div>
          );
        })()}

        <button className="btn btn-primary" onClick={submit}>
          {existing ? 'Update shot' : 'Add shot'}
        </button>
      </div>
    </Modal>
  );
}

// ==============================
// MODAL
// ==============================
function Modal({ children, onClose }){
  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0,
        background:'rgba(20,42,32,0.45)',
        display:'flex', alignItems:'flex-end', justifyContent:'center',
        zIndex:50, padding:0,
        animation:'fadeIn 0.2s ease both'
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:'var(--bg)',
          width:'100%', maxWidth:480,
          borderTopLeftRadius:24, borderTopRightRadius:24,
          padding:'24px 20px', maxHeight:'90vh', overflowY:'auto',
          borderTop:'1px solid var(--line)',
          animation:'fadeIn 0.25s ease both'
        }}>
        {children}
      </div>
    </div>
  );
}

// ==============================
// ROUND SUMMARY MODAL
// ==============================
function RoundSummaryModal({ round, totals, handicap, onClose }) {
  const grossDiff = totals.score - totals.par;
  const netDiff   = Math.round(totals.netScore) - totals.par;

  const sgRows = [
    ['OTT',  totals.OTT],
    ['APP',  totals.APP],
    ['ARG',  totals.ARG],
    ['PUTT', totals.PUTT],
    ['Total', totals.total],
  ];

  // Build hole-by-hole score string (e.g. 4·3·5 …)
  const holeScores = round.holes
    .map(h => {
      const done = h.shots?.some(s => s.lie_after === 'hole');
      return done ? h.shots.length : '—';
    })
    .join('  ');

  // Copy-to-clipboard text
  const summaryText = [
    `⛳ ${round.course_name}`,
    `📅 ${fmtDate(round.date)}`,
    ``,
    `Score: ${totals.score} (${grossDiff > 0 ? '+' : ''}${grossDiff === 0 ? 'E' : grossDiff}) · Par ${totals.par} · ${totals.holesCompleted} holes`,
    handicap != null ? `Net:   ${Math.round(totals.netScore)} (${netDiff > 0 ? '+' : ''}${netDiff === 0 ? 'E' : netDiff}) · Hcp ${handicap > 0 ? '+' : ''}${handicap}` : '',
    ``,
    `Strokes Gained`,
    `  OTT   ${fmt(totals.OTT)}`,
    `  APP   ${fmt(totals.APP)}`,
    `  ARG   ${fmt(totals.ARG)}`,
    `  PUTT  ${fmt(totals.PUTT)}`,
    `  Total ${fmt(totals.total)}`,
    ``,
    `Holes: ${holeScores}`,
    ``,
    `UnderPar · underpar.app`,
  ].filter(l => l !== null && l !== undefined && (l !== '' || true)).join('\n').replace(/\n{3,}/g, '\n\n');

  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="display" style={{fontSize:22, fontWeight:500}}>Round summary</div>
        <button className="btn-icon" onClick={onClose} style={{width:32, height:32}}>
          <X size={16}/>
        </button>
      </div>

      {/* Course + date */}
      <div style={{marginBottom:18}}>
        <div className="display" style={{fontSize:17, fontWeight:600, lineHeight:1.2}}>{round.course_name}</div>
        <div style={{fontSize:13, color:'var(--ink-soft)', marginTop:2}}>{fmtDate(round.date)}</div>
      </div>

      {/* Score block */}
      <div className="card-flat" style={{padding:14, marginBottom:14}}>
        <div style={{display:'flex', gap:20, alignItems:'baseline', flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:2}}>Gross</div>
            <div className="display num" style={{fontSize:28, fontWeight:700, lineHeight:1}}>
              {totals.score}
              <span style={{fontSize:14, color:'var(--ink-soft)', marginLeft:4}}>
                {grossDiff === 0 ? 'E' : (grossDiff > 0 ? '+' : '') + grossDiff}
              </span>
            </div>
          </div>
          {handicap != null && (
            <div>
              <div style={{fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:2}}>Net (hcp {handicap > 0 ? '+' : ''}{handicap})</div>
              <div className="display num" style={{fontSize:28, fontWeight:700, lineHeight:1}}>
                {Math.round(totals.netScore)}
                <span style={{fontSize:14, color:'var(--ink-soft)', marginLeft:4}}>
                  {netDiff === 0 ? 'E' : (netDiff > 0 ? '+' : '') + netDiff}
                </span>
              </div>
            </div>
          )}
          <div style={{marginLeft:'auto', textAlign:'right'}}>
            <div style={{fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:2}}>Holes</div>
            <div className="display num" style={{fontSize:22, fontWeight:600, lineHeight:1}}>
              {totals.holesCompleted}<span style={{fontSize:12, color:'var(--ink-soft)'}}>/{round.holes.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SG breakdown */}
      <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:8}}>Strokes Gained</div>
      <div className="card-flat" style={{padding:'10px 14px', marginBottom:18}}>
        {sgRows.map(([label, val], i) => (
          <div key={label} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'7px 0',
            borderBottom: i < sgRows.length - 1 ? '1px solid var(--line-soft)' : 'none',
            fontWeight: label === 'Total' ? 600 : 400,
          }}>
            <span style={{fontSize:13, color: label === 'Total' ? 'var(--ink)' : 'var(--ink-soft)'}}>{label}</span>
            <span className="display num" style={{fontSize:15}}>
              <SGNumber value={val}/>
            </span>
          </div>
        ))}
      </div>

      {/* Hole scores strip */}
      <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:8}}>Hole scores</div>
      <div className="card-flat" style={{padding:'10px 14px', marginBottom:20}}>
        <div style={{display:'flex', flexWrap:'wrap', gap:'4px 10px', fontVariantNumeric:'tabular-nums', fontSize:13}}>
          {round.holes.map((h, i) => {
            const done = h.shots?.some(s => s.lie_after === 'hole');
            const diff = done ? h.shots.length - h.par : null;
            return (
              <span key={i} style={{
                display:'inline-flex', flexDirection:'column', alignItems:'center',
                minWidth:22, lineHeight:1.3,
              }}>
                <span style={{fontSize:9, color:'var(--ink-faint)'}}>{h.hole_num}</span>
                <span style={{
                  fontWeight:600,
                  color: diff === null ? 'var(--ink-faint)' : diff < 0 ? 'var(--pos)' : diff > 0 ? 'var(--neg)' : 'var(--ink)'
                }}>
                  {done ? h.shots.length : '·'}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Copy button */}
      <button className="btn btn-ghost" onClick={copy} style={{gap:8}}>
        {copied ? <Check size={14}/> : <BookOpen size={14}/>}
        {copied ? 'Copied!' : 'Copy summary to clipboard'}
      </button>
    </div>
  );
}

// ==============================
// ROUND DETAIL
// ==============================
function RoundDetailScreen({ round, onBack, onDelete, onCaddy, onEditRound, onUpdateMeta, handicap }){
  const totals = roundTotals(round, handicap);
  const [holeIdx, setHoleIdx] = useState(0);
  const [showEditMeta, setShowEditMeta] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editName, setEditName] = useState(round.course_name);
  const [editDate, setEditDate] = useState(round.date);
  const [editHandicap, setEditHandicap] = useState(
    round.handicap != null ? String(round.handicap) : (handicap != null ? String(handicap) : '')
  );
  const hole = round.holes[holeIdx];
  // Per-hole strokes given (for the focused hole) using the same SI/even allocation
  const strokesArr = handicap != null ? strokesPerHole(round.holes, handicap) : round.holes.map(() => 0);
  const holeStrokes = strokesArr[holeIdx] || 0;
  const ht = hole ? holeTotals(hole, holeStrokes) : null;

  const grossDiff = totals.score - totals.par;
  const netDiff = Math.round(totals.netScore) - totals.par;

  return (
    <div className="fade-in">
      <Header
        onBack={onBack}
        title={round.course_name}
        subtitle={fmtDate(round.date)}
      />

      {/* Round summary */}
      <Section title="Round summary">
        <div className="card" style={{padding:18}}>
          {/* SG row — scratch + (optional) net */}
          <div style={{display:'flex', alignItems:'baseline', gap:18, marginBottom:14, flexWrap:'wrap'}}>
            <div>
              <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)'}}>SG vs scratch</div>
              <div className="display num" style={{fontSize:44, fontWeight:600, lineHeight:1, letterSpacing:'-0.03em'}}>
                <SGNumber value={totals.total} />
              </div>
            </div>
            {handicap != null && (
              <div style={{paddingLeft:18, borderLeft:'1px solid var(--line-soft)'}}>
                <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)'}}>vs hcp {handicap > 0 ? '+' : ''}{handicap}</div>
                <div className="display num" style={{fontSize:32, fontWeight:600, lineHeight:1, letterSpacing:'-0.02em', color: totals.netTotal >= 0 ? 'var(--pos)' : 'var(--neg)'}}>
                  <SGNumber value={totals.netTotal} />
                </div>
              </div>
            )}
          </div>

          {/* Score row */}
          <div style={{display:'flex', alignItems:'baseline', gap:18, marginBottom:0, paddingBottom:14, borderBottom:'1px solid var(--line-soft)'}}>
            <div>
              <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)'}}>Gross</div>
              <div className="display num" style={{fontSize:24, fontWeight:600, lineHeight:1}}>
                {totals.score} <span style={{fontSize:13, color:'var(--ink-soft)'}}>
                  {grossDiff === 0 ? 'E' : (grossDiff > 0 ? '+' : '') + grossDiff}
                </span>
              </div>
            </div>
            {handicap != null && (
              <div>
                <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)'}}>Net</div>
                <div className="display num" style={{fontSize:24, fontWeight:600, lineHeight:1}}>
                  {Math.round(totals.netScore)} <span style={{fontSize:13, color:'var(--ink-soft)'}}>
                    {netDiff === 0 ? 'E' : (netDiff > 0 ? '+' : '') + netDiff}
                  </span>
                </div>
              </div>
            )}
            <div style={{marginLeft:'auto', textAlign:'right'}}>
              <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)'}}>Holes</div>
              <div className="display num" style={{fontSize:24, fontWeight:600, lineHeight:1}}>
                {totals.holesCompleted}<span style={{fontSize:13, color:'var(--ink-soft)'}}>/{round.holes.length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2" style={{paddingTop:14}}>
            {[['OTT', totals.OTT], ['APP', totals.APP], ['ARG', totals.ARG], ['PUTT', totals.PUTT]].map(([k,v]) => (
              <div key={k}>
                <div style={{fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:4}}>{k}</div>
                <div className="display num" style={{fontSize:20, fontWeight:600}}>
                  <SGNumber value={v} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Hole-by-hole detail */}
      <Section title="Hole by hole">
        <div className={`grid gap-1 mb-4`} style={{gridTemplateColumns: `repeat(${Math.min(round.holes.length, 9)}, 1fr)`}}>
          {round.holes.slice(0, 9).map((h, i) => {
            const hT = holeTotals(h);
            const done = h.shots?.some(s => s.lie_after === 'hole');
            return (
              <button key={i}
                onClick={() => setHoleIdx(i)}
                className={`hole-tile ${holeIdx === i ? 'current' : done ? 'done' : ''}`}>
                <div className="hole-tile-num">{h.hole_num}</div>
                <div className="hole-tile-score">{done ? h.shots.length : '—'}</div>
                {done && <div style={{fontSize:9, marginTop:1, opacity:0.85, fontVariantNumeric:'tabular-nums'}}>{fmt(hT.total, 1)}</div>}
              </button>
            );
          })}
        </div>
        {round.holes.length > 9 && (
          <div className={`grid gap-1`} style={{gridTemplateColumns: `repeat(9, 1fr)`}}>
            {round.holes.slice(9, 18).map((h, i) => {
              const idx = i + 9;
              const hT = holeTotals(h);
              const done = h.shots?.some(s => s.lie_after === 'hole');
              return (
                <button key={idx}
                  onClick={() => setHoleIdx(idx)}
                  className={`hole-tile ${holeIdx === idx ? 'current' : done ? 'done' : ''}`}>
                  <div className="hole-tile-num">{h.hole_num}</div>
                  <div className="hole-tile-score">{done ? h.shots.length : '—'}</div>
                  {done && <div style={{fontSize:9, marginTop:1, opacity:0.85, fontVariantNumeric:'tabular-nums'}}>{fmt(hT.total, 1)}</div>}
                </button>
              );
            })}
          </div>
        )}

        {hole && (
          <div className="card mt-4" style={{padding:16}}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)'}}>
                  Hole {hole.hole_num} · Par {hole.par} · {hole.yardage}y
                  {handicap != null && holeStrokes > 0 && (
                    <span style={{marginLeft:6, color:'var(--ink-soft)'}}>
                      · {holeStrokes >= 1 ? `${Math.floor(holeStrokes)}${holeStrokes > 1 ? '★★' : '★'}` : `${(holeStrokes).toFixed(2)}★`}
                    </span>
                  )}
                </div>
                <div className="display" style={{fontSize:22, fontWeight:600, lineHeight:1.1, marginTop:2}}>
                  {hole.shots?.length || 0}{' '}
                  <span style={{fontSize:14, color:'var(--ink-soft)', fontWeight:400}}>
                    ({hole.shots?.length ? (hole.shots.length - hole.par > 0 ? '+' : '') + (hole.shots.length - hole.par) : '—'})
                  </span>
                  {handicap != null && hole.shots?.length > 0 && holeStrokes > 0 && (
                    <span style={{fontSize:12, color:'var(--ink-faint)', marginLeft:8, fontWeight:400, fontStyle:'italic'}}>
                      net {(hole.shots.length - holeStrokes).toFixed(holeStrokes >= 1 && holeStrokes % 1 === 0 ? 0 : 1)}
                    </span>
                  )}
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="display num" style={{fontSize:22, fontWeight:600}}>
                  <SGNumber value={ht?.total}/>
                </div>
                {handicap != null && (
                  <div className="num" style={{fontSize:12, color:'var(--ink-faint)', marginTop:2}}>
                    net <SGNumber value={ht?.netTotal} dp={2}/>
                  </div>
                )}
              </div>
            </div>
            <hr className="divider" />
            <div className="space-y-2 mt-3">
              {(hole.shots || []).map((s, i) => {
                const { sg, cat } = shotSG(s, hole.par, i);
                const carry = impliedShotDistance(s);
                return (
                  <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, padding:'6px 0', borderBottom: i < hole.shots.length-1 ? '1px solid var(--line-soft)' : 'none'}}>
                    <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0, flex:1, flexWrap:'wrap'}}>
                      <span style={{fontFamily:'Fraunces, serif', fontSize:14, fontWeight:600, color:'var(--ink-faint)', minWidth:18}}>{i+1}.</span>
                      <span className="chip" style={{fontSize:10, padding:'2px 7px'}}>{cat}</span>
                      {s.club && (
                        <span style={{
                          fontFamily:'Fraunces, serif', fontSize:12, fontWeight:600,
                          color:'var(--ink)', padding:'2px 7px',
                          border:'1px solid var(--ink)', borderRadius:999
                        }}>
                          {CLUB_LABEL[s.club] || s.club}
                        </span>
                      )}
                      {carry && (
                        <span className="num" style={{
                          fontSize:11, fontWeight:600, color:'var(--ink-soft)',
                          fontVariantNumeric:'tabular-nums'
                        }}>
                          ≈{carry.value}{carry.unit}
                        </span>
                      )}
                      <span style={{color:'var(--ink-soft)', fontSize:12}}>
                        {s.dist_before}{s.lie_before==='green'?'ft':'y'} {LIE_LABEL[s.lie_before].toLowerCase()}
                        {' → '}
                        {s.lie_after === 'hole' ? 'in' : `${s.dist_after}${(s.lie_after==='green'||s.lie_after==='hole')?'ft':'y'} ${LIE_LABEL[s.lie_after].toLowerCase()}`}
                      </span>
                    </div>
                    <span className="num" style={{fontFamily:'Fraunces', fontWeight:600, fontSize:14, marginLeft:8}}>
                      <SGNumber value={sg}/>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Section>

      <Section title="Manage round">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button className="btn btn-ghost" onClick={() => onEditRound(round.id)}>
            <Edit3 size={14}/> Edit shots
          </button>
          <button className="btn btn-ghost" onClick={() => setShowEditMeta(true)}>
            <Edit3 size={14}/> Edit details
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-ghost" onClick={() => setShowSummary(true)}>
            <BarChart3 size={14}/> View summary
          </button>
          <button className="btn btn-ghost" onClick={onCaddy}>
            <Compass size={14}/> Green reads
          </button>
        </div>
      </Section>

      <Section>
        <button className="btn btn-danger" onClick={() => { if (confirm(`Delete this round at ${round.course_name}? This cannot be undone.`)) onDelete(); }}>
          <Trash2 size={14}/> Delete round
        </button>
      </Section>

      {showEditMeta && (
        <Modal onClose={() => setShowEditMeta(false)}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="display" style={{fontSize:22, fontWeight:500}}>Edit details</div>
              <button className="btn-icon" onClick={() => setShowEditMeta(false)} style={{width:32, height:32}}>
                <X size={16}/>
              </button>
            </div>
            <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:6}}>Course</div>
            <input className="input mb-3" value={editName} onChange={e => setEditName(e.target.value)} />
            <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:6}}>Date</div>
            <input className="input mb-3" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
            <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:6}}>Handicap (this round)</div>
            <input
              className="input mb-1"
              type="number"
              step="0.1"
              placeholder={handicap != null ? `Global: ${handicap}` : 'No global handicap set'}
              value={editHandicap}
              onChange={e => setEditHandicap(e.target.value)}
              inputMode="decimal"
            />
            <div style={{fontSize:11, color:'var(--ink-faint)', marginBottom:16, fontStyle:'italic'}}>
              Overrides your global handicap for this round only.
            </div>
            <button className="btn btn-primary" onClick={() => {
              const hcp = editHandicap.trim() === '' ? null : parseFloat(editHandicap);
              onUpdateMeta(round.id, {
                course_name: editName.trim() || round.course_name,
                date: editDate,
                handicap: (hcp === null || isNaN(hcp)) ? null : hcp,
              });
              setShowEditMeta(false);
            }}>
              Save changes
            </button>
          </div>
        </Modal>
      )}

      {showSummary && (
        <Modal onClose={() => setShowSummary(false)}>
          <RoundSummaryModal round={round} totals={totals} handicap={handicap} onClose={() => setShowSummary(false)} />
        </Modal>
      )}

      <div style={{height:32}}/>
    </div>
  );
}

// ==============================
// MY BAG
// ==============================
function MyBagScreen({ db, onUpdateBag, clubStats, onBack }){
  const inBag = new Set(db.bag || []);
  const toggle = (id) => {
    const next = inBag.has(id)
      ? (db.bag || []).filter(c => c !== id)
      : [...(db.bag || []), id];
    onUpdateBag(next);
  };
  const count = inBag.size;
  const limit = 14;
  const qualifiedCount = Object.values(clubStats || {}).filter(s => s.qualified).length;

  return (
    <div className="fade-in">
      <Header onBack={onBack} title="My bag" subtitle={`${count} ${count === 1 ? 'club' : 'clubs'} selected`} />

      <Section>
        <div className="card-flat" style={{padding:14, fontSize:13, color:'var(--ink-soft)', lineHeight:1.5}}>
          {count === 0
            ? "Tap clubs to add them to your bag. Once you've added clubs, the shot picker will only show your bag by default — with a 'Show all clubs' option for unusual choices. Clubs you use during a round are added automatically."
            : count > limit
              ? `You're carrying ${count} clubs. The rules of golf cap a bag at ${limit} — prune as needed.`
              : `Tap to add or remove. Clubs you use mid-round get added here automatically.`}
        </div>
        {qualifiedCount > 0 && (
          <div style={{fontSize:11, color:'var(--ink-faint)', marginTop:8, fontStyle:'italic', paddingLeft:4}}>
            {qualifiedCount} {qualifiedCount === 1 ? 'club' : 'clubs'} qualified for suggestions · manage in Settings
          </div>
        )}
      </Section>

      {CLUB_GROUPS.map(group => {
        const clubs = DEFAULT_BAG.filter(c => c.group === group);
        return (
          <Section key={group} title={group}>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {clubs.map(c => {
                const selected = inBag.has(c.id);
                return (
                  <button key={c.id}
                    onClick={() => toggle(c.id)}
                    className="lie-pill"
                    style={{
                      flex:'0 0 auto',
                      padding:'10px 14px',
                      fontSize:14,
                      fontWeight:500,
                      minWidth:54,
                      background: selected ? 'var(--ink)' : 'var(--surface)',
                      color: selected ? 'var(--surface)' : 'var(--ink)',
                      borderColor: selected ? 'var(--ink)' : 'var(--line)',
                    }}
                    aria-label={c.full}>
                    {c.label}
                    {selected && <Check size={12} style={{display:'inline', marginLeft:6, verticalAlign:'middle'}}/>}
                  </button>
                );
              })}
            </div>
          </Section>
        );
      })}

      <div style={{height:32}}/>
    </div>
  );
}

// ==============================
// SETTINGS
// ==============================
function SettingsScreen({ db, onUpdateSettings, clubStats, onBack }){
  const settings = db.settings || {};
  const suggestionsOn = settings.clubSuggestionsEnabled !== false;
  const qualifiedCount = Object.values(clubStats || {}).filter(s => s.qualified).length;

  // Local handicap state — string so empty input doesn't snap to 0
  const [hcpStr, setHcpStr] = useState(
    settings.handicap == null ? '' : String(settings.handicap)
  );
  const parsedHcp = hcpStr.trim() === '' ? null : parseFloat(hcpStr);
  const isValidHcp = parsedHcp === null || (!isNaN(parsedHcp) && parsedHcp >= -10 && parsedHcp <= 54);

  const saveHcp = () => {
    if (!isValidHcp) return;
    onUpdateSettings({ handicap: parsedHcp });
  };

  return (
    <div className="fade-in">
      <Header onBack={onBack} title="Settings" subtitle="Preferences"/>

      {/* Handicap */}
      <Section title="Handicap">
        <div className="card" style={{padding:16}}>
          <div style={{fontSize:13, color:'var(--ink-soft)', lineHeight:1.5, marginBottom:14}}>
            Used to calculate net score and a personal SG baseline so you can see how you played against your own level, not just scratch.
          </div>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            <input
              type="number"
              step="0.1"
              className="input num-input"
              style={{fontSize:32, padding:'10px 14px', flex:1, maxWidth:140, textAlign:'center'}}
              placeholder="—"
              value={hcpStr}
              onChange={e => setHcpStr(e.target.value)}
              onBlur={saveHcp}
              inputMode="decimal"
            />
            <button className="btn btn-primary" onClick={saveHcp}
              disabled={!isValidHcp}
              style={{flex:'0 0 auto', width:'auto', padding:'14px 22px', opacity: isValidHcp ? 1 : 0.4}}>
              Save
            </button>
          </div>
          {!isValidHcp && (
            <div style={{fontSize:11, color:'var(--neg)', marginTop:8}}>
              Handicap should be between −10 and 54.
            </div>
          )}
          {settings.handicap != null && isValidHcp && (
            <div style={{fontSize:11, color:'var(--ink-faint)', marginTop:8, fontStyle:'italic'}}>
              Saved · current handicap {settings.handicap > 0 ? '+' : ''}{settings.handicap}
            </div>
          )}
        </div>
      </Section>

      {/* Suggestions */}
      <Section title="Club suggestions">
        <div className="card" style={{padding:14}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
            <div style={{flex:1, minWidth:0}}>
              <div className="display" style={{fontSize:15, fontWeight:600, lineHeight:1.2, marginBottom:2}}>
                Suggest clubs as I play
              </div>
              <div style={{fontSize:12, color:'var(--ink-soft)', lineHeight:1.4}}>
                Uses your last 20 shots per club to suggest the right club for the distance and lie. Needs 20+ logged shots per club to qualify.
              </div>
              <div style={{fontSize:11, color:'var(--ink-faint)', marginTop:6, fontStyle:'italic'}}>
                {qualifiedCount === 0
                  ? 'No clubs ready yet · keep logging shots'
                  : `${qualifiedCount} ${qualifiedCount === 1 ? 'club' : 'clubs'} qualified`
                }
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ clubSuggestionsEnabled: !suggestionsOn })}
              aria-label={`Suggestions ${suggestionsOn ? 'on' : 'off'}`}
              style={{
                width:52, height:30, borderRadius:999,
                background: suggestionsOn ? 'var(--ink)' : 'var(--line)',
                border:'none', position:'relative', cursor:'pointer',
                transition:'background 0.18s ease', flexShrink:0
              }}>
              <span style={{
                position:'absolute',
                top:3, left: suggestionsOn ? 25 : 3,
                width:24, height:24, borderRadius:'50%',
                background:'var(--surface)',
                transition:'left 0.18s ease',
                boxShadow:'0 1px 3px rgba(0,0,0,0.15)'
              }}/>
            </button>
          </div>
        </div>
      </Section>

      <div style={{height:32}}/>
    </div>
  );
}

// ==============================
// CADDY (embedded)
// ==============================
function CaddyScreen({ onBack }){
  return (
    <div className="fade-in" style={{display:'flex', flexDirection:'column', height:'100vh'}}>
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        padding:'12px 16px',
        borderBottom:'1px solid var(--line-soft)',
        background:'var(--bg)',
        flexShrink:0
      }}>
        <button className="btn-icon" onClick={onBack} aria-label="Back" style={{width:36, height:36}}>
          <ChevronLeft size={18}/>
        </button>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-faint)'}}>Reads, slopes, breaks</div>
          <div className="display" style={{fontSize:18, fontWeight:600, lineHeight:1.1, letterSpacing:'-0.01em'}}>Greens</div>
        </div>
        <a href={CADDY_URL} target="_blank" rel="noopener noreferrer"
           className="btn-icon" aria-label="Open Caddy in new tab" style={{width:36, height:36, textDecoration:'none'}}>
          <ArrowRight size={16} style={{transform:'rotate(-45deg)'}}/>
        </a>
      </div>
      <iframe
        src={CADDY_URL}
        title="Caddy"
        style={{
          flex:1, width:'100%', border:'none', display:'block', background:'#fff'
        }}
        allow="geolocation; camera; clipboard-read; clipboard-write"
      />
    </div>
  );
}


// ==============================
// STATS
// ==============================
function StatsScreen({ db, onBack }){
  const allRounds = Object.values(db.rounds);
  const rounds = allRounds
    .filter(r => roundTotals(r).holesCompleted >= 9)
    .sort((a,b) => (a.date || '').localeCompare(b.date || ''));

  // Club aggregates use ALL shots ever recorded (not gated to completed rounds)
  const clubAgg = {};
  allRounds.forEach(r => (r.holes || []).forEach(h => (h.shots || []).forEach((s, i) => {
    if (!s.club) return;
    const sg = shotSG(s, h.par, i).sg;
    if (!clubAgg[s.club]) clubAgg[s.club] = { count: 0, sg: 0 };
    clubAgg[s.club].count += 1;
    clubAgg[s.club].sg += sg;
  })));
  const SHOTS_THRESHOLD = 10;
  const qualifying = Object.entries(clubAgg)
    .filter(([_, v]) => v.count >= SHOTS_THRESHOLD)
    .map(([id, v]) => {
      const meta = DEFAULT_BAG.find(c => c.id === id);
      return {
        id,
        label: meta?.label || id,
        full: meta?.full || id,
        group: meta?.group || '',
        count: v.count,
        totalSG: v.sg,
        avgSG: v.sg / v.count,
      };
    })
    .sort((a, b) => b.avgSG - a.avgSG);
  const inProgress = Object.entries(clubAgg)
    .filter(([_, v]) => v.count > 0 && v.count < SHOTS_THRESHOLD)
    .map(([id, v]) => {
      const meta = DEFAULT_BAG.find(c => c.id === id);
      return { id, label: meta?.label || id, count: v.count };
    })
    .sort((a, b) => b.count - a.count);

  if (rounds.length === 0 && qualifying.length === 0 && inProgress.length === 0) {
    return (
      <div className="fade-in">
        <Header onBack={onBack} title="Stats" subtitle="Aggregate"/>
        <Section>
          <div className="card" style={{padding:20, textAlign:'center'}}>
            <BarChart3 size={28} style={{color:'var(--ink-faint)', margin:'0 auto 12px'}}/>
            <div style={{fontSize:13, color:'var(--ink-soft)'}}>
              Stats appear once you've completed at least 9 holes.
            </div>
          </div>
        </Section>
      </div>
    );
  }

  // Aggregate
  const all = { OTT:0, APP:0, ARG:0, PUTT:0, total:0, holes:0, score:0, par:0 };
  rounds.forEach(r => {
    const t = roundTotals(r);
    all.OTT += t.OTT; all.APP += t.APP; all.ARG += t.ARG; all.PUTT += t.PUTT;
    all.total += t.total; all.holes += t.holesCompleted;
    all.score += t.score; all.par += t.par;
  });
  const per18 = all.holes > 0 ? 18 / all.holes : 0;

  // Per-round trend (most recent first for display, oldest first for chart)
  const trend = rounds.map(r => {
    const t = roundTotals(r);
    const factor = t.holesCompleted ? 18 / t.holesCompleted : 0;
    return { date: r.date, course: r.course_name, total: t.total * factor, OTT: t.OTT * factor, APP: t.APP * factor, ARG: t.ARG * factor, PUTT: t.PUTT * factor };
  });

  // Sparkline data — total SG per round, scaled
  const min = Math.min(...trend.map(t => t.total), 0);
  const max = Math.max(...trend.map(t => t.total), 0);
  const range = max - min || 1;
  const W = 320, H = 80, pad = 4;
  const points = trend.map((t, i) => {
    const x = pad + (i / Math.max(trend.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((t.total - min) / range) * (H - pad * 2);
    return { x, y, t };
  });
  const path = points.length > 1
    ? 'M ' + points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')
    : '';
  const zeroY = H - pad - ((0 - min) / range) * (H - pad * 2);

  return (
    <div className="fade-in">
      <Header onBack={onBack} title="Stats" subtitle={`${rounds.length} round${rounds.length>1?'s':''}`}/>

      {rounds.length > 0 && (
      <Section title="All-time per-18">
        <div className="card" style={{padding:18}}>
          <div className="flex items-baseline justify-between mb-3">
            <div className="display num" style={{fontSize:48, fontWeight:600, lineHeight:1, letterSpacing:'-0.03em'}}>
              <SGNumber value={all.total * per18}/>
            </div>
            <div style={{fontSize:11, color:'var(--ink-faint)', letterSpacing:'0.12em', textTransform:'uppercase'}}>SG Total</div>
          </div>
          <div className="grid grid-cols-4 gap-2" style={{paddingTop:14, borderTop:'1px solid var(--line-soft)'}}>
            {[['OTT', all.OTT], ['APP', all.APP], ['ARG', all.ARG], ['PUTT', all.PUTT]].map(([k,v]) => (
              <div key={k}>
                <div style={{fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:4}}>{k}</div>
                <div className="display num" style={{fontSize:20, fontWeight:600}}>
                  <SGNumber value={v * per18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
      )}

      {/* Sparkline */}
      {trend.length > 1 && (
        <Section title="SG Total · trend">
          <div className="card" style={{padding:14}}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:'auto', display:'block'}}>
              <line x1={pad} x2={W-pad} y1={zeroY} y2={zeroY} stroke="var(--line)" strokeDasharray="2,3" strokeWidth="1"/>
              {path && <path d={path} stroke="var(--ink)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>}
              {points.map((p,i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3} fill={p.t.total >= 0 ? 'var(--pos)' : 'var(--neg)'}/>
              ))}
            </svg>
            <div style={{fontSize:11, color:'var(--ink-faint)', textAlign:'center', marginTop:6}}>
              Oldest <span style={{margin:'0 8px'}}>·</span> Latest
            </div>
          </div>
        </Section>
      )}

      {/* Per round table */}
      {rounds.length > 0 && (
      <Section title="Round-by-round">
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div style={{padding:'10px 14px', display:'grid', gridTemplateColumns:'1fr 50px 50px 50px 50px 60px', gap:6, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-faint)', borderBottom:'1px solid var(--line-soft)', fontWeight:600}}>
            <div>Round</div><div style={{textAlign:'right'}}>OTT</div><div style={{textAlign:'right'}}>APP</div><div style={{textAlign:'right'}}>ARG</div><div style={{textAlign:'right'}}>PUTT</div><div style={{textAlign:'right'}}>Total</div>
          </div>
          {trend.slice().reverse().map((t, i) => (
            <div key={i} style={{padding:'10px 14px', display:'grid', gridTemplateColumns:'1fr 50px 50px 50px 50px 60px', gap:6, fontSize:13, alignItems:'center', borderBottom:'1px solid var(--line-soft)'}}>
              <div style={{minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                <div className="display" style={{fontSize:14, fontWeight:500}}>{t.course}</div>
                <div style={{fontSize:11, color:'var(--ink-faint)'}}>{fmtDate(t.date)}</div>
              </div>
              <div className="num" style={{textAlign:'right'}}><SGNumber value={t.OTT} dp={1}/></div>
              <div className="num" style={{textAlign:'right'}}><SGNumber value={t.APP} dp={1}/></div>
              <div className="num" style={{textAlign:'right'}}><SGNumber value={t.ARG} dp={1}/></div>
              <div className="num" style={{textAlign:'right'}}><SGNumber value={t.PUTT} dp={1}/></div>
              <div className="num display" style={{textAlign:'right', fontWeight:600}}><SGNumber value={t.total}/></div>
            </div>
          ))}
        </div>
      </Section>
      )}

      {/* Club performance — gated to 10+ shots per club */}
      <Section title="Club performance" action={
        <span className="chip" style={{fontStyle:'italic'}}>{SHOTS_THRESHOLD}+ shots</span>
      }>
        {qualifying.length === 0 && inProgress.length === 0 && (
          <div className="card" style={{padding:18, textAlign:'center'}}>
            <Briefcase size={22} style={{color:'var(--ink-faint)', margin:'0 auto 10px'}}/>
            <div style={{fontSize:13, color:'var(--ink-soft)', lineHeight:1.5}}>
              Tag the club on each shot. Once any club has {SHOTS_THRESHOLD}+ recorded shots, its average SG appears here.
            </div>
          </div>
        )}

        {qualifying.length > 0 && (
          <div className="card" style={{padding:0, overflow:'hidden', marginBottom: inProgress.length ? 12 : 0}}>
            <div style={{padding:'10px 14px', display:'grid', gridTemplateColumns:'52px 1fr 50px 60px 60px', gap:6, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-faint)', borderBottom:'1px solid var(--line-soft)', fontWeight:600}}>
              <div>Club</div><div>Type</div><div style={{textAlign:'right'}}>N</div><div style={{textAlign:'right'}}>Avg</div><div style={{textAlign:'right'}}>Total</div>
            </div>
            {qualifying.map((c, i) => (
              <div key={c.id} style={{padding:'10px 14px', display:'grid', gridTemplateColumns:'52px 1fr 50px 60px 60px', gap:6, fontSize:13, alignItems:'center', borderBottom: i < qualifying.length - 1 ? '1px solid var(--line-soft)' : 'none'}}>
                <div style={{
                  fontFamily:'Fraunces, serif', fontSize:16, fontWeight:600,
                  background:'var(--surface)', border:'1px solid var(--ink)',
                  borderRadius:8, padding:'4px 0', textAlign:'center'
                }}>
                  {c.label}
                </div>
                <div style={{fontSize:12, color:'var(--ink-soft)'}}>{c.full}</div>
                <div className="num" style={{textAlign:'right', color:'var(--ink-faint)'}}>{c.count}</div>
                <div className="num display" style={{textAlign:'right', fontWeight:600}}><SGNumber value={c.avgSG} dp={2}/></div>
                <div className="num" style={{textAlign:'right'}}><SGNumber value={c.totalSG} dp={1}/></div>
              </div>
            ))}
          </div>
        )}

        {inProgress.length > 0 && (
          <div className="card-flat" style={{padding:14}}>
            <div style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:10, fontWeight:600}}>
              Building data
            </div>
            <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
              {inProgress.map(c => (
                <div key={c.id} style={{
                  display:'flex', alignItems:'center', gap:6,
                  padding:'6px 10px', borderRadius:999,
                  background:'var(--surface)', border:'1px solid var(--line)',
                  fontSize:12
                }}>
                  <span style={{fontFamily:'Fraunces, serif', fontWeight:600}}>{c.label}</span>
                  <span className="num" style={{color:'var(--ink-faint)'}}>{c.count}/{SHOTS_THRESHOLD}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <div style={{height:32}}/>
    </div>
  );
}

// ==============================
// APP ROOT
// ==============================
export default function App(){
  const [db, setDB] = useState(null);
  const [view, setView] = useState('home');
  const [selectedRoundId, setSelectedRoundId] = useState(null);

  useEffect(() => {
    (async () => { setDB(await loadDB()); })();
  }, []);

  useEffect(() => {
    if (db) saveDB(db);
  }, [db]);

  // Club stats — memoized; recomputed only when rounds change.
  // Must be called above any early returns to keep hook order consistent.
  const clubStats = useMemo(() => buildClubStats((db && db.rounds) || {}), [db && db.rounds]);
  const suggestionsEnabled = ((db && db.settings) || {}).clubSuggestionsEnabled !== false;

  if (!db) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)'}}>
        <FontStyles/>
        <div className="display" style={{fontSize:32, fontStyle:'italic', color:'var(--ink-soft)'}}>UnderPar</div>
      </div>
    );
  }

  // Navigation handlers
  const goHome = () => { setView('home'); setSelectedRoundId(null); };
  const startNew = () => setView('newRound');
  const resume = () => setView('activeRound');
  const openRound = (id) => { setSelectedRoundId(id); setView('roundDetail'); };
  const openStats = () => setView('stats');
  const openBag = () => setView('myBag');
  const openSettings = () => setView('settings');
  const openCaddy = () => setView('caddy');

  // DB mutations
  const createRound = (round, updatedCourses) => {
    setDB(prev => ({
      ...prev,
      rounds: { ...prev.rounds, [round.id]: round },
      courses: updatedCourses,
      activeRoundId: round.id,
    }));
    setView('activeRound');
  };
  const updateActiveRoundHoles = (newHoles) => {
    setDB(prev => {
      if (!prev.activeRoundId) return prev;
      const r = prev.rounds[prev.activeRoundId];
      return { ...prev, rounds: { ...prev.rounds, [r.id]: { ...r, holes: newHoles } } };
    });
  };
  const finishActiveRound = () => {
    const id = db.activeRoundId;
    setDB(prev => {
      const r = prev.rounds[id];
      if (!r) return { ...prev, activeRoundId: null };
      const course = prev.courses[r.course_id];
      // If the course has no template yet but the user entered par/yardage on every hole this round, save them as the template for next time.
      const allFilled = r.holes.every(h => h.par && h.yardage);
      const shouldSeed = course && !course.holeTemplate && allFilled && r.holes.length >= 9;
      if (!shouldSeed) return { ...prev, activeRoundId: null };
      const template = r.holes.map(h => ({
        hole_num: h.hole_num,
        par: h.par,
        yardage: h.yardage,
        ...(h.name ? { name: h.name } : {}),
      }));
      return {
        ...prev,
        activeRoundId: null,
        courses: {
          ...prev.courses,
          [course.id]: { ...course, holeTemplate: template },
        },
      };
    });
    setSelectedRoundId(id);
    setView('roundDetail');
  };
  const abandonActiveRound = () => {
    setDB(prev => {
      const id = prev.activeRoundId;
      const { [id]: _, ...rest } = prev.rounds;
      return { ...prev, rounds: rest, activeRoundId: null };
    });
    goHome();
  };
  const deleteRound = (id) => {
    setDB(prev => {
      const { [id]: _, ...rest } = prev.rounds;
      return { ...prev, rounds: rest, activeRoundId: prev.activeRoundId === id ? null : prev.activeRoundId };
    });
    goHome();
  };
  // Bag handlers — auto-add on use, manual edit in My Bag screen
  const addClubToBag = (clubId) => {
    setDB(prev => {
      const bag = prev.bag || [];
      if (bag.includes(clubId)) return prev;
      return { ...prev, bag: [...bag, clubId] };
    });
  };
  const updateBag = (newBag) => {
    setDB(prev => ({ ...prev, bag: newBag }));
  };
  const updateSettings = (patch) => {
    setDB(prev => ({ ...prev, settings: { ...(prev.settings || {}), ...patch } }));
  };
  // Edit existing saved round — re-activate it for editing
  const editRound = (id) => {
    setDB(prev => ({ ...prev, activeRoundId: id }));
    setView('activeRound');
  };
  // Update round metadata (name, date)
  const updateRoundMeta = (id, patch) => {
    setDB(prev => {
      const r = prev.rounds[id];
      if (!r) return prev;
      return { ...prev, rounds: { ...prev.rounds, [id]: { ...r, ...patch } } };
    });
  };

  return (
    <div style={{minHeight:'100vh', background:'var(--bg)', maxWidth: 480, margin:'0 auto'}}>
      <FontStyles/>
      {view === 'home' && (
        <HomeScreen db={db}
          onStart={startNew}
          onResume={resume}
          onOpen={openRound}
          onStats={openStats}
          onCaddy={openCaddy}
          onBag={openBag}
          onSettings={openSettings}
        />
      )}
      {view === 'newRound' && (
        <NewRoundScreen db={db} onCreate={createRound} onBack={goHome}/>
      )}
      {view === 'activeRound' && db.activeRoundId && (
        <ActiveRoundScreen
          round={db.rounds[db.activeRoundId]}
          onUpdateHole={updateActiveRoundHoles}
          onFinish={finishActiveRound}
          onAbandon={abandonActiveRound}
          onBack={goHome}
          bag={db.bag || []}
          onClubUsed={addClubToBag}
          clubStats={clubStats}
          suggestionsEnabled={suggestionsEnabled}
          handicap={(db.settings || {}).handicap}
        />
      )}
      {view === 'roundDetail' && selectedRoundId && db.rounds[selectedRoundId] && (
        <RoundDetailScreen
          round={db.rounds[selectedRoundId]}
          onBack={goHome}
          onDelete={() => deleteRound(selectedRoundId)}
          onCaddy={openCaddy}
          onEditRound={editRound}
          onUpdateMeta={updateRoundMeta}
          handicap={db.rounds[selectedRoundId]?.handicap ?? (db.settings || {}).handicap}
        />
      )}
      {view === 'caddy' && (
        <CaddyScreen onBack={goHome}/>
      )}
      {view === 'myBag' && (
        <MyBagScreen
          db={db}
          onUpdateBag={updateBag}
          clubStats={clubStats}
          onBack={goHome}
        />
      )}
      {view === 'settings' && (
        <SettingsScreen
          db={db}
          onUpdateSettings={updateSettings}
          clubStats={clubStats}
          onBack={goHome}
        />
      )}
      {view === 'stats' && (
        <StatsScreen db={db} onBack={goHome}/>
      )}
    </div>
  );
}
