/* ---------- Robot definitions (12) ---------- */
const ROBOT_LIST = [
  { id: 'canSlinger', fa: 'قوطی‌بان', en: 'Can Slinger', unlock: 0, cost: 100, recharge: 7,
    roleFa: 'مهاجم دوربرد', roleEn: 'Ranged attacker',
    abFa: 'گلوله‌های فلزی به نزدیک‌ترین دشمن خط می‌زند.', abEn: 'Fires metal pellets at the nearest enemy in its lane.',
    useFa: 'پشت خط بچین و شلیک را به آن بسپار.', useEn: 'Place behind the lane and let it shoot.',
    descFa: 'از قوطی کنسرو و چراغ‌قوه ساخته شده؛ اولین ربات آرین.', descEn: 'Made from a tin can and a flashlight; Arin\'s first build.',
    levels: [{ dmg: 22, hp: 100 }, { dmg: 28, hp: 115 }, { dmg: 35, hp: 135 }], atkInt: 1.4, mainStat: 'dmg', upCost: [180, 360] },
  { id: 'dynamo', fa: 'دینام‌ساز', en: 'Dynamo Maker', unlock: 0, cost: 50, recharge: 6,
    roleFa: 'تولیدکننده جرقه', roleEn: 'Spark producer',
    abFa: 'هر چند ثانیه جرقه تولید می‌کند.', abEn: 'Generates Spark every few seconds.',
    useFa: 'اول بچین تا جریان جرقه برقرار شود.', useEn: 'Build first to establish Spark flow.',
    descFa: 'جعبه باتری کهنه با دینام دوچرخه و پنل خورشیدی شکسته.', descEn: 'Old battery box with a bike dynamo and cracked solar panel.',
    levels: [{ prod: 25, int: 8, hp: 80 }, { prod: 30, int: 7.5, hp: 95 }, { prod: 38, int: 7, hp: 110 }], mainStat: 'prod', upCost: [150, 320] },
  { id: 'spring', fa: 'فنرکوب', en: 'Spring Bouncer', unlock: 2, cost: 125, recharge: 8,
    roleFa: 'کنترل نزدیک و عقب‌انداز', roleEn: 'Close-range knockback',
    abFa: 'با فنر جلو می‌کوبد، آسیب می‌زند و دشمن را عقب می‌اندازد.', abEn: 'Spring-punches enemies, dealing damage and knocking them back.',
    useFa: 'جلوی خط بگذار تا دشمن‌ها عقب بیفتند.', useEn: 'Place at lane front to push enemies back.',
    descFa: 'فنر بزرگ با کلاه‌خود اسباب‌بازی و چرخ اسکیت.', descEn: 'A big spring with a toy helmet and skateboard wheels.',
    levels: [{ dmg: 35, hp: 140 }, { dmg: 44, hp: 160 }, { dmg: 55, hp: 185 }], atkInt: 3, mainStat: 'dmg', upCost: [160, 330] },
  { id: 'barrel', fa: 'بشکه‌انداز', en: 'Barrel Lobber', unlock: 4, cost: 175, recharge: 9,
    roleFa: 'آسیب منطقه‌ای', roleEn: 'Area damage',
    abFa: 'بمب فلزی پرتاب می‌کند؛ انفجار به دشمن‌های اطراف هم می‌رسد.', abEn: 'Lobs metal bombs that splash damage nearby enemies.',
    useFa: 'وسط دسته‌های دشمن بچین.', useEn: 'Place where enemies cluster.',
    descFa: 'بشکه روغن با لوله کج و اهرم دست‌ساز.', descEn: 'Oil barrel with a crooked tube and hand-built lever.',
    levels: [{ dmg: 45, aoe: 25, hp: 90 }, { dmg: 56, aoe: 31, hp: 105 }, { dmg: 70, aoe: 39, hp: 125 }], atkInt: 2.8, mainStat: 'dmg', upCost: [200, 400] },
  { id: 'window', fa: 'سپرپنجره', en: 'Window Shield', unlock: 6, cost: 150, recharge: 8,
    roleFa: 'تانک دفاعی', roleEn: 'Defensive tank',
    abFa: 'سلامت بسیار بالا؛ جلوی دشمن‌ها را می‌گیرد.', abEn: 'Very high health; blocks and delays enemies.',
    useFa: 'جلوی ربات‌های پشتی دیوار بساز.', useEn: 'Wall it in front of your backline.',
    descFa: 'قالب پنجره قدیمی با ورق پلاستیکی ضخیم.', descEn: 'Old window frame with a thick plastic sheet.',
    levels: [{ hp: 250 }, { hp: 300 }, { hp: 360 }], mainStat: 'hp', upCost: [170, 340] },
  { id: 'coil', fa: 'سیم‌پیچ‌زن', en: 'Coil Zapper', unlock: 8, cost: 180, recharge: 9,
    roleFa: 'آسیب زنجیره‌ای', roleEn: 'Chain damage',
    abFa: 'برق زنجیره‌ای تا ۳ دشمن نزدیک را می‌زند.', abEn: 'Electric arc chains to up to 3 nearby enemies.',
    useFa: 'دشمنان دسته‌دسته‌اند، این را بچین.', useEn: 'Deploy against grouped enemies.',
    descFa: 'موتور ماشین لباسشویی با سیم‌پیچ مسی درخشان.', descEn: 'Washing-machine motor with a glowing copper coil.',
    levels: [{ dmg: 20, chain: 3, hp: 110 }, { dmg: 25, chain: 3, hp: 125 }, { dmg: 32, chain: 4, hp: 145 }], atkInt: 3, mainStat: 'dmg', upCost: [210, 420] },
  { id: 'wrench', fa: 'آچارکوب', en: 'Wrench Basher', unlock: 10, cost: 150, recharge: 8,
    roleFa: 'آسیب سنگین نزدیک', roleEn: 'Heavy close damage',
    abFa: 'با چکش سنگین به دشمن نزدیک می‌کوبد.', abEn: 'Hammer-strikes close enemies with heavy damage.',
    useFa: 'پشت سپر بچین و کوبش را ببین.', useEn: 'Place behind a shield and let it smash.',
    descFa: 'جعبه‌ابزار با دو بازو: آچار و چکش.', descEn: 'A toolbox with two arms: wrench and hammer.',
    levels: [{ dmg: 60, hp: 190 }, { dmg: 75, hp: 215 }, { dmg: 92, hp: 245 }], atkInt: 2.2, mainStat: 'dmg', upCost: [190, 380] },
  { id: 'projector', fa: 'پروژکتوربان', en: 'Projector Guard', unlock: 12, cost: 130, recharge: 8,
    roleFa: 'کندکن و آشکارساز', roleEn: 'Slow & reveal',
    abFa: 'پرتوی نور: دشمن را ۲۵٪ کند می‌کند و استتار را می‌شکند.', abEn: 'Light beam slows enemies 25% and breaks camouflage.',
    useFa: 'برای دشمنان استتارشده ضروری است.', useEn: 'Essential against camouflaged enemies.',
    descFa: 'پایه چراغ مطالعه با سر پروژکتور و آینه ترک‌خورده.', descEn: 'Desk-lamp stand with a projector head and cracked mirror.',
    levels: [{ slow: 25, hp: 100 }, { slow: 32, hp: 115 }, { slow: 40, hp: 130 }], mainStat: 'slow', upCost: [160, 320] },
  { id: 'welder', fa: 'جوشکارک', en: 'Welder Medic', unlock: 14, cost: 175, recharge: 9,
    roleFa: 'تعمیرکار ربات‌ها', roleEn: 'Ally repair',
    abFa: 'ربات‌های خانه‌های مجاور را ترمیم می‌کند.', abEn: 'Restores health of robots in adjacent cells.',
    useFa: 'پشت خط جنگی بچین تا خط زنده بماند.', useEn: 'Place behind the battle line to sustain it.',
    descFa: 'رادیوی قدیمی با ماسک جوشکاری و بازوی مسی.', descEn: 'Old radio with a welding mask and copper arm.',
    levels: [{ heal: 16, hp: 120 }, { heal: 20, hp: 135 }, { heal: 26, hp: 155 }], mainStat: 'heal', upCost: [200, 400] },
  { id: 'frost', fa: 'یخچالک', en: 'Frost Fridge', unlock: 16, cost: 200, recharge: 10,
    roleFa: 'کنترل سرما', roleEn: 'Area control',
    abFa: 'هوای سرد: آسیب + کندی ۳۰٪ دشمنان جلویش.', abEn: 'Cold blast damages and slows enemies ahead 30%.',
    useFa: 'جلوی موج سنگین دشمن بچین.', useEn: 'Deploy ahead of heavy enemy waves.',
    descFa: 'کمپرسور یخچال با نازل و فن کوچک.', descEn: 'Fridge compressor with a nozzle and small fan.',
    levels: [{ dmg: 18, slow: 30, hp: 130 }, { dmg: 23, slow: 38, hp: 150 }, { dmg: 29, slow: 46, hp: 175 }], atkInt: 2, mainStat: 'dmg', upCost: [220, 440] },
  { id: 'pipe', fa: 'لوله‌پرتاب', en: 'Pipe Piercer', unlock: 18, cost: 210, recharge: 10,
    roleFa: 'شلیک نافذ', roleEn: 'Piercing shot',
    abFa: 'میخک فلزی که از بدنه چند دشمن عبور می‌کند.', abEn: 'Metal bolt that pierces through several enemies.',
    useFa: 'در خط‌هایی با صف طولانی دشمن عالی است.', useEn: 'Great in lanes with long enemy lines.',
    descFa: 'لوله‌های فولادی مختلف با فنر بزرگ عقب.', descEn: 'Steel pipes of different lengths with a big rear spring.',
    levels: [{ dmg: 28, pierce: 4, hp: 120 }, { dmg: 35, pierce: 5, hp: 140 }, { dmg: 44, pierce: 6, hp: 165 }], atkInt: 2, mainStat: 'dmg', upCost: [240, 480] },
  { id: 'hacker', fa: 'هکر صفحه‌کلید', en: 'Keyboard Hacker', unlock: 20, cost: 230, recharge: 10,
    roleFa: 'مختل‌کننده', roleEn: 'Disabler',
    abFa: 'پالس مزاحمت: قابلیت ویژه دشمنان اطراف را قطع و کندشان می‌کند.', abEn: 'Interference pulse disables enemy specials and slows them.',
    useFa: 'کنار دشمنان ویژه بچین.', useEn: 'Deploy near special enemies.',
    descFa: 'کیس قدیمی با صفحه‌کلید و نمایشگر سبز کدنویسی.', descEn: 'Old PC tower with keyboard and scrolling green code.',
    levels: [{ dur: 2.5, hp: 110 }, { dur: 3, hp: 125 }, { dur: 3.5, hp: 145 }], cd: 8, mainStat: 'dur', upCost: [250, 500] },
];
const ROBOT_BY_ID = {}; ROBOT_LIST.forEach(r => ROBOT_BY_ID[r.id] = r);

/* ---------- Enemy definitions (10) ---------- */
const ENEMY_LIST = {
  roller: { fa: 'غلتک استاندارد', en: 'Standard Roller', hp: 100, speed: 22, dmg: 12, unlockStg: 1,
    briefFa: 'دشمن پایه کارخانه؛ ساده و پیوسته می‌آید.', briefEn: 'Basic factory unit; steady and simple.',
    counterFa: 'قوطی‌بان و دینام‌ساز کافی است.', counterEn: 'Can Slinger and Dynamo suffice.' },
  capsule: { fa: 'کپسول سپردار', en: 'Capsule Shield', hp: 180, shield: 150, speed: 14, dmg: 12, unlockStg: 1,
    briefFa: 'سپر ضخیم جلوی بدنش را می‌پوشاند؛ اول سپر را بشکن.', briefEn: 'Thick front shield; break it first.',
    counterFa: 'بشکه‌انداز و آتش سنگین مؤثرتر است.', counterEn: 'Barrel Lobber and heavy fire work best.' },
  needle: { fa: 'سوزن‌انداز', en: 'Needle Shooter', hp: 110, speed: 20, dmg: 18, ranged: 420, atkInt: 3, unlockStg: 1,
    briefFa: 'از دور به ربات‌هایت شلیک می‌کند.', briefEn: 'Shoots your robots from a distance.',
    counterFa: 'سریعش کن یا زودتر از بینش ببر.', counterEn: 'Slow it or take it out early.' },
  jet: { fa: 'غلتک جت', en: 'Jet Roller', hp: 130, speed: 30, dmg: 12, boost: true, unlockStg: 4,
    briefFa: 'توربین‌هایش روشن می‌شود و ناگهان تند می‌تازد.', briefEn: 'Turbines ignite for sudden speed bursts.',
    counterFa: 'فنرکوب عقبش می‌اندازد؛ کندکن‌ها هم خوبند.', counterEn: 'Spring Bouncer knockback; slows also help.' },
  pulse: { fa: 'سپرپالس', en: 'Pulse Shield', hp: 220, speed: 18, dmg: 12, pulse: true, unlockStg: 7,
    briefFa: 'پالس محافظ اطرافیانش را کم‌آسیب می‌کند.', briefEn: 'Protective pulse reduces damage to nearby enemies.',
    counterFa: 'اول خودش را هدف بگیر.', counterEn: 'Focus it down first.' },
  laser: { fa: 'چشم لیزری', en: 'Laser Eye', hp: 150, speed: 12, dmg: 45, beam: 500, charge: 1.5, atkInt: 3.5, unlockStg: 10,
    briefFa: 'مکث می‌کند، شارژ می‌شود و پرتوی مرگبار می‌زند.', briefEn: 'Stops, charges, then fires a deadly beam.',
    counterFa: 'حین شارژ حمله کن؛ سپرپنجره ضربه را تاب می‌آورد.', counterEn: 'Attack during charge; Window Shield tanks it.' },
  micro: { fa: 'تعمیرکار کوچک', en: 'Micro-Tool Repairer', hp: 170, speed: 24, dmg: 10, healer: 20, unlockStg: 13,
    briefFa: 'دشمنان آسیب‌دیده را ترمیم می‌کند.', briefEn: 'Repairs damaged enemy robots.',
    counterFa: 'اول تعمیرکار را نابود کن!', counterEn: 'Destroy the repairer first!' },
  crusher: { fa: 'کوبنده سنگین', en: 'Heavy Crusher', hp: 550, speed: 9, dmg: 80, vsShield: 2, unlockStg: 16,
    briefFa: 'زره‌پوش سنگین؛ به سپرها آسیب دوچران می‌زند.', briefEn: 'Heavy armor; double damage to shields.',
    counterFa: 'یخچالک و آچارکوب با سپر پیشانی.', counterEn: 'Frost Fridge + Wrench Basher behind a shield.' },
  commander: { fa: 'فرمانده شبکه', en: 'Network Commander', hp: 300, speed: 16, dmg: 12, commander: true, unlockStg: 19,
    briefFa: 'دشمنان اطراف را تندتر می‌کند و غلتک احضار می‌کند.', briefEn: 'Speeds up nearby enemies and summons rollers.',
    counterFa: 'هدف اول؛ هکر صفحه‌کلید پالسش را قطع می‌کند.', counterEn: 'Priority target; Hacker disables its pulse.' },
  boss: { fa: 'نگهبان هسته', en: 'Core Guardian', hp: 4200, speed: 6, dmg: 30, boss: true, unlockStg: 20,
    briefFa: 'نگهبان فصل؛ پرتو، موج ضربه، سپر و احضار دارد.', briefEn: 'Season guardian; beam, shockwave, shield, summon.',
    counterFa: 'همه آموخته‌هایت را به‌کار بگیر!', counterEn: 'Use everything you have learned!' },
};
const ENEMY_IDS = Object.keys(ENEMY_LIST);

/* ---------- Stage definitions (20) ---------- */
/* wave: { t: seconds from stage start (or from prev wave trigger), spawns: [{e, lanes:[..]|'any', n, gap}] } */
function makeStages() {
  const S = [];
  const W = (t, spawns) => ({ t, spawns });
  const sp = (e, n, lanes, gap) => ({ e, n, lanes: lanes || 'any', gap: gap || 2.5 });
  for (let i = 0; i < 20; i++) S.push({ n: i + 1 });
  /* AREA 1 — yard */
  S[0].theme = 0; S[0].nameFa = 'اولین دفاع'; S[0].nameEn = 'First Defense';
  S[0].waves = [W(6, [sp('roller', 1, [2])]), W(14, [sp('roller', 2, [1, 3], 4)]), W(26, [sp('roller', 3, 'any', 5)]), W(46, [sp('roller', 4, 'any', 3.5)])];
  S[1].theme = 0; S[1].nameFa = 'درگیری سپردار'; S[1].nameEn = 'Shield Trouble';
  S[1].waves = [W(6, [sp('roller', 2, 'any', 4)]), W(16, [sp('capsule', 1, [2]), sp('roller', 1, [4], 3)]), W(30, [sp('capsule', 1, 'any'), sp('roller', 2, 'any', 4)]), W(48, [sp('capsule', 2, 'any', 4), sp('roller', 2, 'any', 3)])];
  S[2].theme = 0; S[2].nameFa = 'آتش دشمن'; S[2].nameEn = 'Incoming Fire';
  S[2].waves = [W(6, [sp('roller', 2, 'any', 4)]), W(16, [sp('needle', 1, [1]), sp('roller', 2, [3, 4], 4)]), W(30, [sp('capsule', 1, 'any'), sp('needle', 1, 'any', 2)]), W(46, [sp('needle', 2, 'any', 4), sp('roller', 3, 'any', 3), sp('capsule', 1, [2])])];
  S[3].theme = 0; S[3].nameFa = 'حمله سرعتی'; S[3].nameEn = 'Speed Attack';
  S[3].waves = [W(6, [sp('roller', 2, 'any', 4)]), W(15, [sp('jet', 1, [0]), sp('roller', 2, [2, 3], 4)]), W(28, [sp('jet', 2, 'any', 3), sp('needle', 1, 'any')]), W(44, [sp('jet', 2, 'any', 2.5), sp('capsule', 1, 'any'), sp('roller', 3, 'any', 3)])];
  S[4].theme = 0; S[4].nameFa = 'موج سنگین'; S[4].nameEn = 'Heavy Wave';
  S[4].waves = [W(6, [sp('roller', 3, 'any', 4)]), W(16, [sp('capsule', 2, 'any', 3), sp('jet', 1, 'any')]), W(30, [sp('needle', 2, 'any', 3), sp('roller', 3, 'any', 3)]), W(46, [sp('jet', 2, 'any', 2.5), sp('capsule', 2, 'any', 3.5), sp('roller', 4, 'any', 2.5)]), W(66, [sp('capsule', 2, 'any', 3), sp('jet', 2, 'any', 2.5), sp('needle', 2, 'any', 3)])];
  /* AREA 2 — garage */
  S[5].theme = 1; S[5].nameFa = 'سپرهای پیشرفته'; S[5].nameEn = 'Advanced Shields';
  S[5].waves = [W(6, [sp('roller', 3, 'any', 4)]), W(16, [sp('capsule', 2, 'any', 3), sp('jet', 2, 'any', 2.5)]), W(32, [sp('jet', 3, 'any', 2.5), sp('capsule', 1, 'any')]), W(50, [sp('capsule', 3, 'any', 3), sp('needle', 2, 'any', 3), sp('roller', 3, 'any', 2.5)])];
  S[6].theme = 1; S[6].nameFa = 'پالس محافظ'; S[6].nameEn = 'Protective Pulse';
  S[6].waves = [W(6, [sp('roller', 2, 'any', 4), sp('capsule', 1, 'any')]), W(18, [sp('pulse', 1, 'any'), sp('jet', 2, 'any', 2.5)]), W(34, [sp('pulse', 1, 'any'), sp('capsule', 2, 'any', 3), sp('needle', 2, 'any', 3)]), W(52, [sp('pulse', 2, 'any', 4), sp('roller', 4, 'any', 2.5), sp('jet', 1, 'any')])];
  S[7].theme = 1; S[7].nameFa = 'کارگاه برقی'; S[7].nameEn = 'Electrical Workshop';
  S[7].waves = [W(6, [sp('roller', 3, 'any', 3.5)]), W(16, [sp('pulse', 1, 'any'), sp('needle', 2, 'any', 3)]), W(30, [sp('capsule', 2, 'any', 3), sp('jet', 3, 'any', 2.5)]), W(46, [sp('pulse', 2, 'any', 3.5), sp('needle', 2, 'any', 3), sp('roller', 4, 'any', 2.5)]), W(66, [sp('capsule', 2, 'any', 3), sp('jet', 2, 'any', 2.5), sp('pulse', 1, 'any'), sp('needle', 2, 'any', 3)])];
  S[8].theme = 1; S[8].nameFa = 'چشم ناظر'; S[8].nameEn = 'The Watching Eye';
  S[8].waves = [W(6, [sp('roller', 3, 'any', 3.5)]), W(16, [sp('jet', 3, 'any', 2.5), sp('capsule', 1, 'any')]), W(30, [sp('pulse', 2, 'any', 3.5), sp('needle', 2, 'any', 3)]), W(46, [sp('capsule', 3, 'any', 3), sp('jet', 2, 'any', 2.5), sp('roller', 4, 'any', 2.5)]), W(68, [sp('pulse', 2, 'any', 3), sp('needle', 3, 'any', 3), sp('capsule', 2, 'any', 3)])];
  S[9].theme = 1; S[9].nameFa = 'آزمون گاراژ'; S[9].nameEn = 'The Garage Test';
  S[9].waves = [W(6, [sp('roller', 4, 'any', 3)]), W(16, [sp('jet', 3, 'any', 2.2), sp('capsule', 2, 'any', 3)]), W(30, [sp('pulse', 2, 'any', 3), sp('needle', 3, 'any', 3)]), W(46, [sp('capsule', 3, 'any', 3), sp('jet', 3, 'any', 2.2)]), W(64, [sp('pulse', 2, 'any', 3), sp('needle', 3, 'any', 3), sp('roller', 5, 'any', 2.5)]), W(84, [sp('capsule', 3, 'any', 3), sp('jet', 3, 'any', 2.2), sp('pulse', 1, 'any'), sp('needle', 2, 'any', 3)])];
  /* AREA 3 — hallway */
  S[10].theme = 2; S[10].nameFa = 'نفوذ به خانه'; S[10].nameEn = 'Breach into the House';
  S[10].blocked = [[1, 4], [6, 2]];
  S[10].waves = [W(6, [sp('roller', 4, 'any', 3), sp('capsule', 1, 'any')]), W(16, [sp('capsule', 2, 'any', 3), sp('jet', 3, 'any', 2.2)]), W(30, [sp('pulse', 2, 'any', 3), sp('needle', 3, 'any', 3)]), W(46, [sp('capsule', 3, 'any', 3), sp('jet', 3, 'any', 2.2), sp('roller', 4, 'any', 2.5)])];
  S[11].theme = 2; S[11].nameFa = 'گم‌شده در تاریکی'; S[11].nameEn = 'Lost in the Dark';
  S[11].blocked = [[4, 1], [7, 3]]; S[11].camo = true;
  S[11].waves = [W(6, [sp('roller', 3, 'any', 3), sp('jet', 2, 'any', 2.5)]), W(16, [sp('jet', 3, 'any', 2.2), sp('capsule', 2, 'any', 3)]), W(30, [sp('jet', 4, 'any', 2.2), sp('pulse', 1, 'any'), sp('needle', 2, 'any', 3)]), W(48, [sp('jet', 4, 'any', 2.2), sp('capsule', 2, 'any', 3), sp('pulse', 1, 'any')])];
  S[12].theme = 2; S[12].nameFa = 'تعمیرگاه دشمن'; S[12].nameEn = 'Enemy Maintenance';
  S[12].blocked = [[3, 2]]; S[12].camo = true;
  S[12].waves = [W(6, [sp('roller', 3, 'any', 3), sp('needle', 2, 'any', 3)]), W(16, [sp('micro', 1, 'any'), sp('capsule', 2, 'any', 3)]), W(32, [sp('micro', 2, 'any', 3.5), sp('jet', 3, 'any', 2.2)]), W(50, [sp('micro', 2, 'any', 3.5), sp('capsule', 3, 'any', 3), sp('pulse', 1, 'any')])];
  S[13].theme = 2; S[13].nameFa = 'نگه‌داشتن اتاق نشیمن'; S[13].nameEn = 'Hold the Living Room';
  S[13].blocked = [[5, 3]]; S[13].camo = true;
  S[13].waves = [W(6, [sp('roller', 4, 'any', 3)]), W(16, [sp('micro', 2, 'any', 3), sp('jet', 3, 'any', 2.2)]), W(32, [sp('capsule', 3, 'any', 3), sp('needle', 3, 'any', 3)]), W(48, [sp('micro', 2, 'any', 3), sp('pulse', 2, 'any', 3), sp('jet', 3, 'any', 2.2)]), W(68, [sp('capsule', 3, 'any', 3), sp('jet', 3, 'any', 2.2), sp('needle', 3, 'any', 3), sp('micro', 1, 'any')])];
  S[14].theme = 2; S[14].nameFa = 'دروازه سنگین'; S[14].nameEn = 'The Heavy Gate';
  S[14].blocked = [[2, 1], [7, 4]]; S[14].camo = true;
  S[14].waves = [W(6, [sp('roller', 4, 'any', 3), sp('capsule', 1, 'any')]), W(18, [sp('micro', 2, 'any', 3), sp('pulse', 2, 'any', 3)]), W(34, [sp('capsule', 3, 'any', 3), sp('jet', 4, 'any', 2.2)]), W(52, [sp('micro', 3, 'any', 3), sp('pulse', 2, 'any', 3), sp('needle', 3, 'any', 3)]), W(72, [sp('capsule', 4, 'any', 3), sp('jet', 4, 'any', 2.2), sp('pulse', 2, 'any', 3)])];
  /* AREA 4 — basement */
  S[15].theme = 3; S[15].nameFa = 'به سوی زیرزمین'; S[15].nameEn = 'Into the Basement';
  S[15].blocked = [[6, 1], [3, 4]];
  S[15].waves = [W(6, [sp('roller', 4, 'any', 3), sp('capsule', 2, 'any', 3)]), W(18, [sp('crusher', 1, 'any'), sp('jet', 3, 'any', 2.2)]), W(34, [sp('crusher', 1, 'any'), sp('micro', 2, 'any', 3), sp('needle', 3, 'any', 3)]), W(52, [sp('crusher', 2, 'any', 4), sp('capsule', 3, 'any', 3), sp('pulse', 1, 'any')])];
  S[16].theme = 3; S[16].nameFa = 'مقاومت سرما'; S[16].nameEn = 'Cold Resistance';
  S[16].blocked = [[4, 2], [8, 4]]; S[16].camo = true;
  S[16].waves = [W(6, [sp('capsule', 3, 'any', 3), sp('roller', 4, 'any', 2.8)]), W(18, [sp('crusher', 2, 'any', 4), sp('micro', 2, 'any', 3)]), W(34, [sp('crusher', 2, 'any', 4), sp('pulse', 2, 'any', 3), sp('jet', 3, 'any', 2.2)]), W(54, [sp('crusher', 3, 'any', 4), sp('capsule', 3, 'any', 3), sp('micro', 2, 'any', 3)])];
  S[17].theme = 3; S[17].nameFa = 'هشدار مرکزی'; S[17].nameEn = 'Central Warning';
  S[17].blocked = [[5, 1], [2, 3], [7, 2]]; S[17].camo = true;
  S[17].waves = [W(6, [sp('roller', 5, 'any', 2.8), sp('jet', 3, 'any', 2.2)]), W(20, [sp('crusher', 2, 'any', 4), sp('capsule', 3, 'any', 3)]), W(38, [sp('crusher', 3, 'any', 4), sp('micro', 3, 'any', 3), sp('pulse', 2, 'any', 3)]), W(58, [sp('crusher', 3, 'any', 4), sp('jet', 4, 'any', 2.2), sp('needle', 3, 'any', 3), sp('micro', 2, 'any', 3)])];
  S[18].theme = 3; S[18].nameFa = 'آخرین خط دفاع'; S[18].nameEn = 'The Last Line';
  S[18].blocked = [[3, 1], [6, 4]]; S[18].camo = true;
  S[18].waves = [W(6, [sp('roller', 5, 'any', 2.8), sp('capsule', 2, 'any', 3)]), W(20, [sp('commander', 1, 'any'), sp('crusher', 1, 'any'), sp('jet', 3, 'any', 2.2)]), W(38, [sp('commander', 1, 'any'), sp('crusher', 2, 'any', 4), sp('micro', 3, 'any', 3)]), W(58, [sp('commander', 2, 'any', 4), sp('crusher', 3, 'any', 4), sp('pulse', 2, 'any', 3), sp('jet', 4, 'any', 2.2)])];
  S[19].theme = 3; S[19].nameFa = 'نگهبان هسته'; S[19].nameEn = 'Core Guardian';
  S[19].blocked = [[4, 1], [6, 4], [1, 2]];
  S[19].boss = true;
  S[19].waves = [W(5, [sp('roller', 4, 'any', 3)]), W(18, [sp('boss', 1, [2])]), W(30, [sp('capsule', 2, 'any', 3), sp('jet', 2, 'any', 2.5)]), W(44, [sp('micro', 2, 'any', 3), sp('pulse', 1, 'any')]), W(56, [sp('capsule', 2, 'any', 3), sp('jet', 3, 'any', 2.2)])];
  return S;
}
const STAGES = makeStages();
function stageArea(st) { return Math.min(3, Math.floor((st - 1) / 5)); }
function stageRobotUnlock(st) { return ROBOT_LIST.find(r => r.unlock === st) || null; }
function stageNewEnemy(st) { return ENEMY_IDS.find(e => ENEMY_LIST[e].unlockStg === st && !['roller', 'capsule', 'needle'].includes(e)) || null; }
