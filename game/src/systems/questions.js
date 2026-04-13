/* ═══════════════════════════════════════════════════════════════
   QUESTION ENGINE
   Kid's original rules:
   - Math question after every level (multiplication / division)
   - Cannot repeat the same question
   - Younger = easier, older = harder
   - If correct: another (different) comes
   - If wrong: another (rephrased, same topic) comes

   Enhancement: 500+ questions per grade, bloom-filter no-repeat,
   three teaching approaches (symbolic, visual-text, word-problem),
   supports math, reading, science.
═══════════════════════════════════════════════════════════════ */

const Questions = (() => {

  /* ── Question bank ─────────────────────────────────────────── */

  // Helper to generate all facts for a times table
  function mulFacts(min, max) {
    const q = [];
    for (let a = min; a <= max; a++) {
      for (let b = min; b <= max; b++) {
        q.push({
          id: `mul_${a}_${b}`,
          subject: 'math',
          type: 'numeric',
          display: `${a} × ${b}`,
          answer: String(a * b),
          hint: `Think: ${a} groups of ${b}. Count by ${b}, ${a} times.`,
          grade: a <= 5 && b <= 5 ? 3 : 4,
        });
        // Division counterpart
        if (a * b > 0) {
          q.push({
            id: `div_${a*b}_${a}`,
            subject: 'math',
            type: 'numeric',
            display: `${a * b} ÷ ${a}`,
            answer: String(b),
            hint: `How many groups of ${a} make ${a * b}?`,
            grade: a <= 5 && b <= 5 ? 3 : 4,
          });
        }
      }
    }
    return q;
  }

  // Grade K–2 addition/subtraction
  function addSubFacts() {
    const q = [];
    for (let a = 0; a <= 10; a++) {
      for (let b = 0; b <= 10; b++) {
        q.push({
          id: `add_${a}_${b}`,
          subject: 'math', type: 'numeric',
          display: `${a} + ${b}`,
          answer: String(a + b),
          hint: `Start at ${a} and count up ${b} more.`,
          grade: a+b <= 10 ? 1 : 2,
        });
        if (a + b <= 20 && a >= b) {
          q.push({
            id: `sub_${a+b}_${b}`,
            subject: 'math', type: 'numeric',
            display: `${a + b} − ${b}`,
            answer: String(a),
            hint: `Start at ${a+b} and count back ${b}.`,
            grade: a+b <= 10 ? 1 : 2,
          });
        }
      }
    }
    return q;
  }

  // Grade K counting
  function countingFacts() {
    const q = [];
    for (let n = 1; n <= 20; n++) {
      q.push({
        id: `count_next_${n}`,
        subject: 'math', type: 'numeric',
        display: `What comes after ${n}?`,
        answer: String(n + 1),
        hint: `Count: 1, 2, 3 ... what's after ${n}?`,
        grade: 'K',
      });
    }
    return q;
  }

  // Grade K — shapes & colors
  function gradeKExtras() {
    const q = [];
    const shapes = [
      { id:'k_shape_circle',    display:'A pizza is shaped like a ___.',   answer:'circle',   hint:'Round and delicious — that\'s a circle!',   grade:'K' },
      { id:'k_shape_square',    display:'A square has ___ sides.',          answer:'4',        hint:'Count the sides of a square: 1, 2, 3, 4.',   grade:'K' },
      { id:'k_shape_triangle',  display:'A triangle has ___ corners.',      answer:'3',        hint:'Tri means three — 3 corners!',               grade:'K' },
    ];
    const colors = [
      { id:'k_color_sky',       display:'The sky is usually what color?',   answer:'blue',     hint:'Look up! The sky is blue on a sunny day.',    grade:'K' },
      { id:'k_color_grass',     display:'Grass is usually what color?',     answer:'green',    hint:'Think of Fluff\'s field — green grass!',      grade:'K' },
      { id:'k_color_sun',       display:'The sun is usually what color?',   answer:'yellow',   hint:'Bright, warm, shining yellow!',               grade:'K' },
    ];
    shapes.forEach(s => q.push({ subject:'math', type:'text', ...s }));
    colors.forEach(c => q.push({ subject:'science', type:'text', ...c }));
    return q;
  }

  // Grade 5 — fractions
  function fractionFacts() {
    const q = [];
    const frac = [
      [1,2],[1,3],[1,4],[2,3],[3,4],[1,5],[2,5],[3,5],[4,5],
      [1,6],[5,6],[1,8],[3,8],[5,8],[7,8],
    ];
    frac.forEach(([n,d]) => {
      // "What is 1/2 of 10?"
      if (10 * n % d === 0) {
        q.push({
          id: `frac_${n}_${d}_of10`,
          subject:'math', type:'numeric',
          display: `What is ${n}/${d} of ${10}?`,
          answer: String(10 * n / d),
          hint: `Divide 10 by ${d}, then multiply by ${n}. So 10÷${d}×${n}.`,
          grade: 5,
        });
      }
      // "What is 1/2 of 8?"
      if (8 * n % d === 0) {
        q.push({
          id: `frac_${n}_${d}_of8`,
          subject:'math', type:'numeric',
          display: `What is ${n}/${d} of ${8}?`,
          answer: String(8 * n / d),
          hint: `Divide 8 by ${d}, then multiply by ${n}.`,
          grade: 5,
        });
      }
    });
    return q;
  }

  // Grade 6 — ratios & percentages
  function ratioFacts() {
    const q = [];
    // percentages of 100
    const pcts = [10,20,25,30,40,50,60,70,75,80,90];
    pcts.forEach(p => {
      q.push({
        id: `pct_${p}_of100`,
        subject:'math', type:'numeric',
        display: `What is ${p}% of 100?`,
        answer: String(p),
        hint: `Percent means "out of 100", so ${p}% of 100 = ${p}.`,
        grade: 6,
      });
    });
    // percentages of 50
    const pcts50 = [10,20,50];
    pcts50.forEach(p => {
      q.push({
        id: `pct_${p}_of50`,
        subject:'math', type:'numeric',
        display: `What is ${p}% of 50?`,
        answer: String(50 * p / 100),
        hint: `First find ${p}% of 100 = ${p}, then halve it.`,
        grade: 6,
      });
    });
    // Simple ratio choose questions
    [
      { id:'ratio_3to6', display:'Which ratio equals 1:2?',       answer:'3:6',   choices:['3:6','3:4','2:3','4:6'],     hint:'1×3=3 and 2×3=6, so 3:6 = 1:2.',         grade:6 },
      { id:'ratio_2to8', display:'Which ratio equals 1:4?',       answer:'2:8',   choices:['2:8','3:9','2:6','4:8'],     hint:'1×2=2 and 4×2=8, so 2:8 = 1:4.',         grade:6 },
      { id:'ratio_unit',  display:'A car travels 60 miles in 1 hour. In 2 hours it travels ___ miles.', answer:'120', hint:'60 × 2 = 120.', grade:6 },
    ].forEach(r => q.push({ subject:'math', type: r.choices ? 'choose' : 'numeric', ...r }));
    return q;
  }

  // Grade 7 — integers & simple expressions
  function integerFacts() {
    const q = [];
    const ops = [
      {id:'int_neg3_plus5',   display:'-3 + 5 = ?',    answer:'2',  hint:'Start at -3 and count up 5.'},
      {id:'int_neg5_plus3',   display:'-5 + 3 = ?',    answer:'-2', hint:'Start at -5 and count up 3.'},
      {id:'int_neg4_plusneg2',display:'-4 + (-2) = ?', answer:'-6', hint:'Adding two negatives: -4 - 2 = -6.'},
      {id:'int_7_minus10',    display:'7 − 10 = ?',    answer:'-3', hint:'7 - 10 goes below zero: -3.'},
      {id:'int_neg3_times2',  display:'-3 × 2 = ?',    answer:'-6', hint:'Negative × positive = negative.'},
      {id:'int_neg4_times_neg2',display:'-4 × (-2) = ?',answer:'8',  hint:'Negative × negative = positive!'},
      {id:'int_12_div_neg3',  display:'12 ÷ (-3) = ?', answer:'-4', hint:'Positive ÷ negative = negative.'},
      {id:'int_neg10_div2',   display:'-10 ÷ 2 = ?',  answer:'-5', hint:'Negative ÷ positive = negative.'},
      {id:'int_abs_neg7',     display:'What is the absolute value of -7?', answer:'7', hint:'Absolute value = distance from zero. |-7| = 7.'},
      {id:'int_abs_pos5',     display:'What is |5|?',  answer:'5',  hint:'The absolute value of a positive number is itself.'},
    ];
    ops.forEach(o => q.push({ subject:'math', type:'numeric', grade:7, ...o }));
    return q;
  }

  // Grade 8 — simple equations
  function equationFacts() {
    const q = [];
    // x + b = c  → x = c - b
    const eqs = [
      {id:'eq_x_plus3_eq7',    display:'x + 3 = 7 → x = ?',    answer:'4',  hint:'Subtract 3 from both sides: x = 7 - 3 = 4.'},
      {id:'eq_x_plus5_eq12',   display:'x + 5 = 12 → x = ?',   answer:'7',  hint:'x = 12 - 5 = 7.'},
      {id:'eq_x_minus2_eq6',   display:'x − 2 = 6 → x = ?',    answer:'8',  hint:'Add 2 to both sides: x = 6 + 2 = 8.'},
      {id:'eq_2x_eq10',        display:'2x = 10 → x = ?',       answer:'5',  hint:'Divide both sides by 2: x = 5.'},
      {id:'eq_3x_eq15',        display:'3x = 15 → x = ?',       answer:'5',  hint:'15 ÷ 3 = 5.'},
      {id:'eq_x_div2_eq4',     display:'x ÷ 2 = 4 → x = ?',    answer:'8',  hint:'Multiply both sides by 2: x = 8.'},
      {id:'eq_2x_plus1_eq9',   display:'2x + 1 = 9 → x = ?',   answer:'4',  hint:'First: 9-1=8, then 8÷2=4.'},
      {id:'eq_3x_minus3_eq12', display:'3x − 3 = 12 → x = ?',  answer:'5',  hint:'12+3=15, then 15÷3=5.'},
      {id:'eq_pyth_3_4',       display:'A right triangle has legs 3 and 4. What is the hypotenuse?', answer:'5', hint:'3²+4²=9+16=25. √25=5.'},
      {id:'eq_pyth_6_8',       display:'Right triangle legs: 6 and 8. Hypotenuse = ?', answer:'10', hint:'6²+8²=36+64=100. √100=10.'},
    ];
    eqs.forEach(e => q.push({ subject:'math', type:'numeric', grade:8, ...e }));
    return q;
  }

  // Grade 5–6 multi-digit
  function multiDigitFacts() {
    const q = [];
    const pairs = [
      [12,4],[13,3],[14,5],[15,6],[24,3],[32,4],[11,8],[21,4],[16,5],[18,3],
      [23,4],[42,3],[22,5],[33,3],[14,7],[25,4],[36,3],[48,2],[15,8],[27,3],
    ];
    for (const [a, b] of pairs) {
      q.push({
        id: `mul2_${a}_${b}`,
        subject: 'math', type: 'numeric',
        display: `${a} × ${b}`,
        answer: String(a * b),
        hint: `Break it up: (${Math.floor(a/10)*b*10}) + (${(a%10)*b}) = ?`,
        grade: 4,
      });
      if ((a * b) % b === 0) {
        q.push({
          id: `div2_${a*b}_${b}`,
          subject: 'math', type: 'numeric',
          display: `${a * b} ÷ ${b}`,
          answer: String(a),
          hint: `How many times does ${b} go into ${a*b}?`,
          grade: 4,
        });
      }
    }
    return q;
  }

  // Science questions — all grades K–8
  const SCIENCE_BANK = [
    // ── Grade K ──────────────────────────────────────────────
    { id:'sci_k_dog_legs',   subject:'science', type:'numeric',  display:'A dog has ___ legs.',                                  answer:'4',    hint:'Count! Dogs have 4 legs.',                              grade:'K' },
    { id:'sci_k_bird_legs',  subject:'science', type:'numeric',  display:'A bird has ___ legs.',                                 answer:'2',    hint:'Birds stand on 2 legs!',                                grade:'K' },
    { id:'sci_k_fish_breathe',subject:'science',type:'choose',   display:'Fish breathe using:',                                  answer:'Gills', choices:['Gills','Lungs','Skin','Noses'], hint:'Fish have gills — like little underwater lungs!', grade:'K' },
    { id:'sci_k_sun_daytime',subject:'science', type:'choose',   display:'The sun gives us light during the:',                   answer:'Day',   choices:['Day','Night','Both','Neither'],                 hint:'The sun shines during the day!',                       grade:'K' },
    { id:'sci_k_plants_need',subject:'science', type:'choose',   display:'Plants need ___ to grow.',                             answer:'Sun and water', choices:['Sun and water','Only water','Only sand','Cold air'], hint:'Plants need sunlight AND water to grow!', grade:'K' },
    { id:'sci_k_ice_melt',   subject:'science', type:'choose',   display:'What happens to ice when it gets warm?',                answer:'It melts', choices:['It melts','It grows','It floats up','It turns blue'], hint:'Heat turns ice into water — it melts!', grade:'K' },

    // ── Grade 1 ──────────────────────────────────────────────
    { id:'sci_1_seasons',    subject:'science', type:'numeric',  display:'How many seasons are there in a year?',                answer:'4',    hint:'Spring, Summer, Fall (Autumn), Winter = 4!',           grade:1 },
    { id:'sci_1_water_states',subject:'science',type:'choose',   display:'Water can be a solid, liquid, or ___.',                answer:'Gas',   choices:['Gas','Rock','Metal','Sand'],                    hint:'Steam is water as a gas!',                             grade:1 },
    { id:'sci_1_sun_source', subject:'science', type:'choose',   display:'The sun provides light and ___.',                      answer:'Heat',  choices:['Heat','Rain','Wind','Snow'],                    hint:'The sun warms the Earth with heat and light.',         grade:1 },
    { id:'sci_1_five_senses',subject:'science', type:'numeric',  display:'How many senses do humans have?',                      answer:'5',    hint:'Sight, hearing, smell, taste, touch = 5!',             grade:1 },
    { id:'sci_1_roots',      subject:'science', type:'choose',   display:'Roots of a plant help it:',                            answer:'Get water from soil', choices:['Get water from soil','Jump up high','Make butterflies','Block the sun'], hint:'Roots absorb water and nutrients from the soil.', grade:1 },
    { id:'sci_1_caterpillar',subject:'science', type:'choose',   display:'A caterpillar becomes a:',                             answer:'Butterfly', choices:['Butterfly','Fish','Bird','Rabbit'],          hint:'Caterpillars grow and change into butterflies!',        grade:1 },

    // ── Grade 2 ──────────────────────────────────────────────
    { id:'sci_legs_spider',  subject:'science', type:'numeric',  display:'How many legs does a spider have?',                    answer:'8',    hint:'Spiders are arachnids — they have 8 legs!',            grade:2 },
    { id:'sci_gravity',      subject:'science', type:'choose',   display:'What pulls objects toward the center of the Earth?',   answer:'Gravity', choices:['Gravity','Magnetism','Friction','Wind'],     hint:'Gravity — it\'s why Fluff falls when he misses a platform!', grade:2 },
    { id:'sci_oxygen',       subject:'science', type:'choose',   display:'Which gas do humans need to breathe?',                 answer:'Oxygen', choices:['Oxygen','Carbon Dioxide','Nitrogen','Hydrogen'], hint:'Oxygen — taken in through your lungs!',              grade:2 },
    { id:'sci_sun_star',     subject:'science', type:'choose',   display:'The Sun is classified as a:',                          answer:'Star',  choices:['Star','Planet','Moon','Asteroid'],              hint:'The Sun is our nearest star!',                          grade:2 },
    { id:'sci_2_herbivore',  subject:'science', type:'choose',   display:'An animal that eats only plants is called a:',         answer:'Herbivore', choices:['Herbivore','Carnivore','Omnivore','Predator'], hint:'Herb = plant, so herbivore eats plants!',           grade:2 },
    { id:'sci_2_cloud_water',subject:'science', type:'choose',   display:'Clouds are made of tiny drops of:',                   answer:'Water', choices:['Water','Sand','Smoke','Sugar'],                hint:'Clouds form when water vapor cools and condenses!',     grade:2 },

    // ── Grade 3 ──────────────────────────────────────────────
    { id:'sci_planets',      subject:'science', type:'numeric',  display:'How many planets are in our solar system?',            answer:'8',    hint:'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune', grade:3 },
    { id:'sci_water_freeze', subject:'science', type:'numeric',  display:'Water freezes at ___ degrees Celsius.',                answer:'0',    hint:'Ice forming — that\'s at 0°C (and 32°F).',             grade:3 },
    { id:'sci_photosyn',     subject:'science', type:'choose',   display:'Plants make food using sunlight — this is called:',   answer:'Photosynthesis', choices:['Photosynthesis','Digestion','Respiration','Evaporation'], hint:'Photo=light, synthesis=making.', grade:3 },
    { id:'sci_water_cycle1', subject:'science', type:'choose',   display:'Water turning from liquid to vapor is called:',        answer:'Evaporation', choices:['Condensation','Evaporation','Precipitation','Runoff'], hint:'Evaporation — the sun heats water and it rises as vapor!', grade:3 },
    { id:'sci_3_food_chain', subject:'science', type:'choose',   display:'In a food chain, plants are usually the:',             answer:'Producers', choices:['Producers','Consumers','Decomposers','Predators'], hint:'Plants produce their own food from sunlight!', grade:3 },
    { id:'sci_3_magnet_attract',subject:'science',type:'choose', display:'Magnets attract objects made of:',                    answer:'Iron or steel', choices:['Iron or steel','Wood','Plastic','Glass'], hint:'Magnets pull on metals like iron and steel!', grade:3 },

    // ── Grade 4 ──────────────────────────────────────────────
    { id:'sci_water_boil',   subject:'science', type:'numeric',  display:'Water boils at ___ degrees Celsius.',                  answer:'100',  hint:'Think: 100°C is when water turns to steam.',           grade:4 },
    { id:'sci_light_speed',  subject:'science', type:'choose',   display:'Light travels faster than sound.',                     answer:'True',  choices:['True','False'],                                hint:'Yes! Light reaches you before the sound does.',         grade:4 },
    { id:'sci_4_states',     subject:'science', type:'choose',   display:'Which is NOT a state of matter?',                     answer:'Energy', choices:['Energy','Solid','Liquid','Gas'],              hint:'Energy is not a state of matter — solid, liquid, and gas are!', grade:4 },
    { id:'sci_4_earth_layers',subject:'science',type:'choose',   display:'The outermost layer of Earth is called the:',          answer:'Crust', choices:['Crust','Mantle','Core','Surface'],             hint:'The thin outer layer we walk on is the crust!',         grade:4 },
    { id:'sci_4_inherited',  subject:'science', type:'choose',   display:'A trait passed from parent to child is called:',       answer:'Inherited', choices:['Inherited','Learned','Adapted','Random'],  hint:'Eye color is inherited — you got it from your parents!', grade:4 },
    { id:'sci_4_shadow',     subject:'science', type:'choose',   display:'Shadows are formed when light is:',                   answer:'Blocked', choices:['Blocked','Reflected','Absorbed','Bent'],    hint:'Stand in front of a light and block it — shadow!',      grade:4 },

    // ── Grade 5 ──────────────────────────────────────────────
    { id:'sci_human_bones',  subject:'science', type:'numeric',  display:'How many bones are in the adult human body?',          answer:'206',  hint:'206 — and you have all of them!',                      grade:5 },
    { id:'sci_heart_beats',  subject:'science', type:'numeric',  display:'The human heart beats about ___ times per minute.',    answer:'70',   hint:'Between 60–100 is normal. About 70 beats per minute!', grade:5 },
    { id:'sci_5_ecosystem',  subject:'science', type:'choose',   display:'An ecosystem includes all living AND nonliving things in an area.', answer:'True', choices:['True','False'], hint:'Ecosystem = biotic (living) + abiotic (nonliving) parts!', grade:5 },
    { id:'sci_5_solarsys',   subject:'science', type:'choose',   display:'The largest planet in our solar system is:',           answer:'Jupiter', choices:['Jupiter','Saturn','Earth','Neptune'],       hint:'Jupiter is so big, 1,300 Earths would fit inside it!',  grade:5 },
    { id:'sci_5_decomposer', subject:'science', type:'choose',   display:'Fungi and some bacteria are:',                         answer:'Decomposers', choices:['Decomposers','Producers','Herbivores','Carnivores'], hint:'Decomposers break down dead matter and recycle nutrients!', grade:5 },
    { id:'sci_5_responsible',subject:'science', type:'choose',   display:'The organ responsible for pumping blood is the:',      answer:'Heart', choices:['Heart','Lung','Brain','Kidney'],              hint:'The heart pumps blood through your whole body!',         grade:5 },

    // ── Grade 6 ──────────────────────────────────────────────
    { id:'sci_6_cell',       subject:'science', type:'choose',   display:'The basic unit of all living things is the:',          answer:'Cell',  choices:['Cell','Atom','Tissue','Organ'],                 hint:'All living things are made of cells!',                  grade:6 },
    { id:'sci_6_nucleus',    subject:'science', type:'choose',   display:'The control center of a cell is the:',                 answer:'Nucleus', choices:['Nucleus','Cell wall','Ribosome','Vacuole'],   hint:'The nucleus contains DNA and controls the cell.',       grade:6 },
    { id:'sci_6_tectonic',   subject:'science', type:'choose',   display:'Earthquakes and volcanoes are caused by movement of:', answer:'Tectonic plates', choices:['Tectonic plates','Ocean tides','Wind currents','The moon'], hint:'Tectonic plates are huge slabs of Earth\'s crust that move!', grade:6 },
    { id:'sci_6_solar_energy',subject:'science',type:'choose',   display:'The original source of energy for almost all food chains on Earth is:', answer:'The Sun', choices:['The Sun','Wind','Volcanoes','The Moon'], hint:'Plants use sunlight, and everything else eats plants or animals!', grade:6 },
    { id:'sci_6_density',    subject:'science', type:'choose',   display:'An object floats in water if its density is ___ than water.', answer:'Less', choices:['Less','Greater','Equal','Double'], hint:'Less dense = floats! More dense = sinks.', grade:6 },

    // ── Grade 7 ──────────────────────────────────────────────
    { id:'sci_7_dna',        subject:'science', type:'choose',   display:'The molecule that carries genetic information is:',    answer:'DNA',   choices:['DNA','RNA','ATP','Protein'],                    hint:'DNA is the blueprint for all living things!',           grade:7 },
    { id:'sci_7_evolution',  subject:'science', type:'choose',   display:'Organisms best suited to their environment survive and reproduce. This is called:', answer:'Natural selection', choices:['Natural selection','Mutation','Extinction','Migration'], hint:'Darwin described this as "survival of the fittest."', grade:7 },
    { id:'sci_7_photosyn_eq',subject:'science', type:'choose',   display:'Photosynthesis produces oxygen AND:',                 answer:'Glucose (sugar)', choices:['Glucose (sugar)','Carbon dioxide','Water','Salt'], hint:'Plants make glucose to use as food!', grade:7 },
    { id:'sci_7_ph7',        subject:'science', type:'choose',   display:'A pH of 7 indicates a solution is:',                  answer:'Neutral', choices:['Neutral','Acidic','Basic','Toxic'],           hint:'pH 7 = neutral. Below 7 = acid, above 7 = base.',       grade:7 },
    { id:'sci_7_circulatory',subject:'science', type:'choose',   display:'The heart, blood, and blood vessels form the ___ system.', answer:'Circulatory', choices:['Circulatory','Nervous','Digestive','Respiratory'], hint:'The circulatory system moves blood around your body!', grade:7 },

    // ── Grade 8 ──────────────────────────────────────────────
    { id:'sci_8_atom_parts', subject:'science', type:'choose',   display:'An atom is made of protons, neutrons, and:',           answer:'Electrons', choices:['Electrons','Molecules','Ions','Quarks'],    hint:'Electrons orbit the nucleus in shells.',                grade:8 },
    { id:'sci_8_element',    subject:'science', type:'choose',   display:'A substance made of only one type of atom is a(n):',   answer:'Element', choices:['Element','Compound','Mixture','Solution'],    hint:'Gold and oxygen are elements — pure one-atom substances!', grade:8 },
    { id:'sci_8_newton1',    subject:'science', type:'choose',   display:'An object in motion stays in motion unless acted on by an outside force. This is Newton\'s ___ law.', answer:'First', choices:['First','Second','Third','Fourth'], hint:'Newton\'s first law = law of inertia!', grade:8 },
    { id:'sci_8_speed',      subject:'science', type:'choose',   display:'Speed is calculated as distance divided by:',          answer:'Time',  choices:['Time','Mass','Force','Energy'],                 hint:'Speed = distance ÷ time.',                              grade:8 },
    { id:'sci_8_reactant',   subject:'science', type:'choose',   display:'In a chemical equation, the starting substances are called:', answer:'Reactants', choices:['Reactants','Products','Catalysts','Bonds'], hint:'Reactants go IN, products come OUT of a reaction!', grade:8 },
  ];

  // Reading questions — all grades K–8
  const READING_BANK = [
    // ── Grade K ──────────────────────────────────────────────
    {
      id:'read_k_bunny_hop', subject:'reading', type:'choose', grade:'K',
      passage:'The bunny hops. The bunny is fast. The bunny is white.',
      display:'What color is the bunny?',
      answer:'White', choices:['White','Brown','Black','Yellow'],
      hint:'Look for the color word in the story.',
    },
    {
      id:'read_k_cat_sat', subject:'reading', type:'choose', grade:'K',
      passage:'The cat sat on the mat. The cat is happy.',
      display:'Where did the cat sit?',
      answer:'On the mat', choices:['On the mat','On the chair','In the tree','On the floor'],
      hint:'The story says the cat sat "on the mat."',
    },
    {
      id:'read_k_red_apple', subject:'reading', type:'choose', grade:'K',
      passage:'Sam has an apple. The apple is red and round. Sam likes apples!',
      display:'What shape is the apple?',
      answer:'Round', choices:['Round','Square','Triangle','Flat'],
      hint:'Look for the shape word in the story.',
    },

    // ── Grade 1 ──────────────────────────────────────────────
    {
      id:'read_1_rain_day', subject:'reading', type:'choose', grade:1,
      passage:'It is raining today. Lily put on her boots and coat. She jumped in every puddle she could find.',
      display:'Why did Lily put on boots and a coat?',
      answer:'Because it was raining', choices:['Because it was raining','Because she was cold','Because she was going to school','Because she lost her shoes'],
      hint:'The story says "it is raining today."',
    },
    {
      id:'read_1_seed_grow', subject:'reading', type:'choose', grade:1,
      passage:'Tom planted a seed in the garden. He watered it every day. After two weeks, a small green plant poked out of the soil.',
      display:'What helped the seed grow?',
      answer:'Tom watered it every day', choices:['Tom watered it every day','Tom talked to it','The seed was magic','It rained very hard'],
      hint:'"He watered it every day" shows Tom helped it grow.',
    },
    {
      id:'read_1_night_stars', subject:'reading', type:'choose', grade:1,
      passage:'At night, the sky turns dark. Stars appear and twinkle. The moon glows bright and lights the path for night animals.',
      display:'What lights the path for night animals?',
      answer:'The moon', choices:['The moon','Street lights','The sun','Stars only'],
      hint:'"The moon glows bright and lights the path."',
    },

    // ── Grade 2 ──────────────────────────────────────────────
    {
      id:'read_bunny1', subject:'reading', type:'choose', grade:2,
      passage:'Fluff woke up early on Tuesday. He ate breakfast and looked out the window. The grass was wet from the rain. "Perfect day for an adventure," he said.',
      display:'Why was the grass wet?',
      answer:'It had rained', choices:['It had rained','Fluff spilled water','There was a river','Someone watered it'],
      hint:'Look at the clue: "wet from the rain".',
    },
    {
      id:'read_rolli1', subject:'reading', type:'choose', grade:2,
      passage:'Rolli discovered that rolling was faster than running. Instead of going around every rock, Rolli rolled right through. "The shortest path," Rolli said, "is the one you make yourself."',
      display:'What did Rolli learn?',
      answer:'Finding your own path can be faster', choices:['Finding your own path can be faster','Rocks are dangerous','Running is always best','Rolling is tiring'],
      hint:'"The shortest path is the one you make yourself."',
    },
    {
      id:'read_2_library', subject:'reading', type:'choose', grade:2,
      passage:'Mia visits the library every Saturday. She always picks three books — one about animals, one about space, and one about adventures. The librarian saves her favorite seat by the window.',
      display:'How many books does Mia pick each visit?',
      answer:'Three', choices:['Three','Two','Five','One'],
      hint:'Count the types of books she chooses.',
    },

    // ── Grade 3 ──────────────────────────────────────────────
    {
      id:'read_star1', subject:'reading', type:'choose', grade:3,
      passage:'Stars are huge balls of hot gas. Our Sun is a star! It looks bigger than other stars because it is much closer to Earth.',
      display:'Why does the Sun look bigger than other stars?',
      answer:'It is closer to Earth', choices:['It is closer to Earth','It is made of ice','It moves faster','It is the only star'],
      hint:'The passage says it "looks bigger because it is much closer."',
    },
    {
      id:'read_champ1', subject:'reading', type:'choose', grade:3,
      passage:'Maya practiced jumping every single day. Some days were hard. Some days she felt tired. But she never stopped. On the day of the competition, she jumped higher than ever before.',
      display:'What is the main message of this story?',
      answer:'Keeping going even on hard days leads to success',
      choices:['Keeping going even on hard days leads to success','Jumping is easy','Maya was always great','Rest is not important'],
      hint:'Think about what Maya did on the hard days — and what happened because of it.',
    },
    {
      id:'read_ocean1', subject:'reading', type:'choose', grade:3,
      passage:'The ocean covers more than 70% of Earth\'s surface. It contains salt water and is home to millions of species of plants and animals.',
      display:'What portion of Earth is covered by ocean?',
      answer:'More than 70%', choices:['More than 70%','About 30%','Exactly half','Less than 50%'],
      hint:'The passage says "more than 70%."',
    },

    // ── Grade 4 ──────────────────────────────────────────────
    {
      id:'read_4_bees', subject:'reading', type:'choose', grade:4,
      passage:'Bees are important pollinators. As a bee visits flowers to collect nectar, pollen sticks to its body and is carried to the next flower. This helps plants make seeds and fruit.',
      display:'Why are bees important to plants?',
      answer:'They carry pollen from flower to flower', choices:['They carry pollen from flower to flower','They water the plants','They protect plants from insects','They eat harmful soil'],
      hint:'The passage explains pollen is carried to the next flower.',
    },
    {
      id:'read_4_arctic', subject:'reading', type:'choose', grade:4,
      passage:'The Arctic fox has thick white fur in winter that acts as camouflage in the snow. In summer, its fur turns brown to blend in with rocks and soil.',
      display:'What is the main reason the fox\'s fur changes color?',
      answer:'To blend in with its environment each season', choices:['To blend in with its environment each season','Because it is sick','To stay warmer','To look more beautiful'],
      hint:'Camouflage = blending in. The fox blends into different backgrounds each season.',
    },
    {
      id:'read_4_author_purpose', subject:'reading', type:'choose', grade:4,
      passage:'A recipe book tells you exactly how to make your favorite meals. It lists ingredients and gives step-by-step instructions.',
      display:'The main purpose of a recipe book is to:',
      answer:'Give instructions for making food', choices:['Give instructions for making food','Tell a funny story','Make the reader sad','Share someone\'s opinion'],
      hint:'Instructions and steps = the author wants to INFORM and help you do something.',
    },

    // ── Grade 5 ──────────────────────────────────────────────
    {
      id:'read_5_renewable', subject:'reading', type:'choose', grade:5,
      passage:'Renewable energy comes from sources that can be replenished naturally, such as the sun, wind, and water. Unlike fossil fuels, renewable sources do not run out and cause less pollution.',
      display:'What makes energy sources "renewable"?',
      answer:'They can be replenished naturally', choices:['They can be replenished naturally','They produce more electricity','They are cheaper','They are stored underground'],
      hint:'Replenished = refilled. The sun and wind never run out!',
    },
    {
      id:'read_5_cause_effect', subject:'reading', type:'choose', grade:5,
      passage:'When factories release smoke into the air, tiny particles mix with water droplets in clouds. This creates acid rain, which can harm forests and lakes when it falls.',
      display:'What causes acid rain according to the passage?',
      answer:'Smoke particles mixing with water in clouds', choices:['Smoke particles mixing with water in clouds','Too much sunshine','Very strong winds','Natural wildfires'],
      hint:'Follow the chain: smoke → mixes with cloud water → acid rain.',
    },
    {
      id:'read_5_figurative', subject:'reading', type:'choose', grade:5,
      passage:'"The classroom was a zoo today," said Mrs. Green, shaking her head with a smile.',
      display:'What does "the classroom was a zoo" most likely mean?',
      answer:'The students were noisy and wild', choices:['The students were noisy and wild','There were real animals in the class','Everyone was at the zoo','The room was decorated with animals'],
      hint:'This is a metaphor — Mrs. Green is comparing the noisy kids to animals at a zoo.',
    },

    // ── Grade 6 ──────────────────────────────────────────────
    {
      id:'read_6_bias', subject:'reading', type:'choose', grade:6,
      passage:'"Smartphones are ruining childhood. Children are always staring at screens instead of playing outside or reading books. Something must be done before it is too late."',
      display:'This passage is an example of:',
      answer:'A biased opinion', choices:['A biased opinion','A factual report','A scientific summary','An instruction manual'],
      hint:'Words like "ruining" and "must be done" show the writer\'s strong opinion without balanced evidence.',
    },
    {
      id:'read_6_inference', subject:'reading', type:'choose', grade:6,
      passage:'Jasmine stared at her empty lunch bag. Her stomach growled loudly. She looked around the cafeteria, hoping no one had heard.',
      display:'What can you infer about Jasmine?',
      answer:'She is hungry and embarrassed', choices:['She is hungry and embarrassed','She is full and happy','She lost her lunch bag','She doesn\'t like school food'],
      hint:'Empty bag + growling stomach + embarrassment = what inference can you draw?',
    },
    {
      id:'read_6_text_structure', subject:'reading', type:'choose', grade:6,
      passage:'First, the settlers arrived on the coast. Next, they built small shelters. Then, they planted crops. Finally, after years of struggle, a town began to form.',
      display:'What text structure is used in this passage?',
      answer:'Sequence / chronological order', choices:['Sequence / chronological order','Compare and contrast','Problem and solution','Cause and effect'],
      hint:'"First, Next, Then, Finally" are sequence signal words.',
    },

    // ── Grade 7 ──────────────────────────────────────────────
    {
      id:'read_7_theme', subject:'reading', type:'choose', grade:7,
      passage:'Despite being the smallest on the team, Leo always gave everything he had. He practiced three hours a day. When the season ended, he was voted most valuable player.',
      display:'What is the theme of this passage?',
      answer:'Hard work and dedication can overcome limitations', choices:['Hard work and dedication can overcome limitations','Size is what matters most','Everyone gets an award','Sports are easy'],
      hint:'Leo was small but worked hard — what lesson does that teach?',
    },
    {
      id:'read_7_central_idea', subject:'reading', type:'choose', grade:7,
      passage:'Coral reefs support about 25% of all ocean species despite covering less than 1% of the ocean floor. They also protect coastlines from storms. Yet warming seas and pollution are causing corals to die at alarming rates.',
      display:'What is the central idea of this passage?',
      answer:'Coral reefs are vital ecosystems that are under serious threat', choices:['Coral reefs are vital ecosystems that are under serious threat','Most fish live in coral reefs','The ocean covers 1% of Earth','Pollution is caused by coral reefs'],
      hint:'The passage tells you why reefs matter AND that they are in danger.',
    },
    {
      id:'read_7_connotation', subject:'reading', type:'choose', grade:7,
      passage:'Calling someone "thrifty" vs. calling them "cheap" both refer to spending little money — but the words feel different.',
      display:'Which word has a MORE POSITIVE connotation?',
      answer:'Thrifty', choices:['Thrifty','Cheap','Neither','Both are the same'],
      hint:'Thrifty suggests smart saving. Cheap suggests being stingy.',
    },

    // ── Grade 8 ──────────────────────────────────────────────
    {
      id:'read_8_argument', subject:'reading', type:'choose', grade:8,
      passage:'"Research shows that students who sleep at least 8 hours perform 20% better on tests. Schools that start after 8:30 AM report fewer absences and better grades. Therefore, all middle schools should start no earlier than 8:30 AM."',
      display:'What type of writing is this?',
      answer:'Argumentative / persuasive', choices:['Argumentative / persuasive','Narrative fiction','Scientific observation','A diary entry'],
      hint:'The writer uses evidence to support a claim and asks for a specific change.',
    },
    {
      id:'read_8_textual_evidence', subject:'reading', type:'choose', grade:8,
      passage:'Malala Yousafzai was shot by armed men in 2012 for speaking out about girls\' education. After recovering, she continued her campaign and became the youngest Nobel Prize laureate.',
      display:'Which statement is best supported by the passage?',
      answer:'Malala showed extraordinary courage and perseverance', choices:['Malala showed extraordinary courage and perseverance','Malala stopped her campaign after being shot','Malala won the Nobel Prize before age 10','Malala spoke against sports'],
      hint:'She was shot but kept going — what word describes that?',
    },
    {
      id:'read_8_irony', subject:'reading', type:'choose', grade:8,
      passage:'The fire station burned down last Tuesday.',
      display:'This sentence is an example of:',
      answer:'Irony', choices:['Irony','Simile','Alliteration','Hyperbole'],
      hint:'A fire STATION catching fire is the opposite of what you\'d expect — that\'s irony!',
    },
  ];

  // Assemble the full bank
  const ALL_QUESTIONS = [
    ...gradeKExtras(),
    ...countingFacts(),
    ...addSubFacts(),
    ...mulFacts(2, 9),
    ...multiDigitFacts(),
    ...fractionFacts(),
    ...ratioFacts(),
    ...integerFacts(),
    ...equationFacts(),
    ...SCIENCE_BANK,
    ...READING_BANK,
  ];

  // Grade ordering for filtering
  const GRADE_ORDER = ['K',1,2,3,4,5,6,7,8];

  function gradeValue(g) {
    const idx = GRADE_ORDER.indexOf(g);
    return idx === -1 ? 3 : idx;
  }

  /* ── Session-level seen set (exact, cleared each session) ─── */
  const _sessionSeen = new Set();
  let _sessionWrongQueue = []; // rephrased questions for wrong answers

  function startSession() {
    _sessionSeen.clear();
    _sessionWrongQueue = [];
  }

  /* ── Core: get next question ──────────────────────────────── */
  function getNext(subject, grade, diffAdjust = 0) {
    const save = window.Save ? window.Save.get() : null;
    const retiredIds = save ? (save.seenQuestionIds || []) : [];

    // Convert grade to numeric value for range filtering
    const baseGradeVal = gradeValue(grade);
    const targetVal = Math.max(0, Math.min(GRADE_ORDER.length - 1, baseGradeVal + diffAdjust));

    // Pool: same subject, grade ±1, not session-seen, not retired
    let pool = ALL_QUESTIONS.filter(q => {
      if (q.subject !== subject) return false;
      if (_sessionSeen.has(q.id)) return false;
      if (retiredIds.includes(q.id)) return false;
      const qVal = gradeValue(q.grade);
      return Math.abs(qVal - targetVal) <= 1;
    });

    // Widen if pool too small
    if (pool.length < 3) {
      pool = ALL_QUESTIONS.filter(q => {
        if (q.subject !== subject) return false;
        if (_sessionSeen.has(q.id)) return false;
        return true;
      });
    }

    // Ultimate fallback: allow retired questions
    if (pool.length === 0) {
      pool = ALL_QUESTIONS.filter(q => q.subject === subject);
    }

    if (pool.length === 0) return null;

    const q = pool[Math.floor(Math.random() * pool.length)];
    _sessionSeen.add(q.id);
    return q;
  }

  /* ── Get a wrong-answer follow-up (rephrased, same topic) ─── */
  function getWrongFollowUp(prevQuestion) {
    // Same subject and grade, different question ID
    const save = window.Save ? window.Save.get() : null;
    const retiredIds = save ? (save.seenQuestionIds || []) : [];

    const pool = ALL_QUESTIONS.filter(q => {
      if (q.subject !== prevQuestion.subject) return false;
      if (q.id === prevQuestion.id) return false;
      if (_sessionSeen.has(q.id)) return false;
      if (retiredIds.includes(q.id)) return false;
      return Math.abs(gradeValue(q.grade) - gradeValue(prevQuestion.grade)) <= 1;
    });

    if (pool.length === 0) return getNext(prevQuestion.subject, prevQuestion.grade);

    const q = pool[Math.floor(Math.random() * pool.length)];
    _sessionSeen.add(q.id);
    return q;
  }

  /* ── Subject rotation per level ──────────────────────────── */
  // Math every other level; reading every 3rd; science every 5th
  function getSubjectForLevel(level) {
    if (level % 5 === 0) return 'science';
    if (level % 3 === 0) return 'reading';
    return 'math';
  }

  /* ── Helper: choose question for a level ─────────────────── */
  function getForLevel(level, grade) {
    const subject = getSubjectForLevel(level);
    const adj = window.Save ? window.Save.getDifficultyAdjustment(subject) : 0;
    return getNext(subject, grade, adj);
  }

  return {
    startSession,
    getNext,
    getWrongFollowUp,
    getForLevel,
    getSubjectForLevel,
  };
})();

window.Questions = Questions;
