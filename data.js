// Meal Planner: plain JavaScript, no libraries.
//
// HOW TO ADD A RECIPE: add one more entry to a section's `recipes` list below.
//   name:        the recipe name
//   channel:     who made the video
//   video:       the YouTube link (one video per recipe, so nothing repeats)
//   makes:       optional, e.g. "Makes 20 idlis" (only when the source says so)
//   ingredients: a list of "quantity ingredient" lines. For a recipe with parts, use
//                { title: "Part name", items: [ ... ] } instead of a plain line.
//   note:        optional, shown under the ingredients
//   from:        where the ingredient list came from
// Quantities are copied from each creator's own video description or recipe page.

const HK = "Hebbar's Kitchen";
const PAGE = "Hebbar's Kitchen recipe page";
const DESC = "Video description";
const CPAGE = "Creator's recipe page";

const sections = [
  // ============================ IDLIS ============================
  {
    id: "idlis",
    title: "Idlis",
    note: "Dal, besan, paneer and sprout idlis are the most protein-rich. The ragi, oats, millet and quinoa idlis are lighter picks.",
    recipes: [
      {
        name: "Moong Dal Idli", channel: HK, video: "https://www.youtube.com/watch?v=OIlT7jESRvk", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 10, "serving": "2 idlis", "basis": "source", "why": "The page says it makes 20 idlis.", "kcal": 173.6, "p": 8.0, "c": 26.8, "f": 4.0},
        makes: "Makes 20 idlis", from: PAGE,
        ingredients: [
          "1 cup moong dal", "1 cup rava (coarse)", "1 cup curd", "2 tbsp oil", "1 tsp mustard seeds",
          "½ tsp chana dal", "½ tsp urad dal", "1 tsp cumin", "1 pinch hing", "A few curry leaves",
          "1 inch ginger, finely chopped", "3 chillies, finely chopped", "2 tbsp carrot, grated", "¼ tsp turmeric",
          "1 tsp salt", "2 tbsp coriander, finely chopped", "1 tsp Eno fruit salt", "Cashews, for garnish",
        ],
      },
      {
        name: "Green Moong & Urad Dal Idli (No Rice)", channel: "Gita's Kitchen",
        video: "https://www.youtube.com/watch?v=bSrGFDI5MF0", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 13, "serving": "2 idlis", "basis": "assumed", "why": "Assumed: about 16 g of dry ingredients per idli (the average of Hebbar's idli recipes).", "kcal": 108.6, "p": 7.4, "c": 19.2, "f": 0.4}, from: DESC,
        ingredients: [
          { title: "Idli", items: ["1 cup split green moong dal", "1 cup white round urad dal", "1 tsp methi (fenugreek) seeds", "Salt, to taste"] },
          {
            title: "Flaxseed podi (to serve)",
            items: [
              "½ cup flax seeds", "½ cup chana dal", "¼ cup urad dal", "¼ cup white sesame seeds", "¼ cup horse gram (kollu)",
              "5 dry red chillies", "2 byadgi chillies", "¼ tsp turmeric powder", "¼ tsp hing (asafoetida)", "3–4 sprigs curry leaves", "Salt",
            ],
          },
        ],
      },
      {
        name: "Protein-Rich Mixed Dal Idli", channel: "Suja's Kitchen & Vlogs",
        video: "https://www.youtube.com/watch?v=ThHrV0c7X4A", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 16, "serving": "2 idlis", "basis": "assumed", "why": "Assumed: about 16 g of dry ingredients per idli (the average of Hebbar's idli recipes).", "kcal": 116.0, "p": 7.2, "c": 19.7, "f": 1.2}, from: DESC,
        ingredients: [
          "1 cup urad dal", "½ cup chana dal", "½ cup moong dal", "½ cup toor dal", "¼ tsp methi (fenugreek) seeds",
          "¼ cup chopped coriander leaves", "¼ cup grated carrot", "Salt, as per taste", "½ tsp mustard seeds",
          "A few curry leaves", "½ tsp hing", "1–2 tsp oil",
        ],
      },
      {
        name: "Chana Dal Idli", channel: "JOOS Food", video: "https://www.youtube.com/watch?v=tM96OQ_g_mU", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 8, "serving": "2 idlis", "basis": "assumed", "why": "Assumed: about 16 g of dry ingredients per idli (the average of Hebbar's idli recipes).", "kcal": 125.1, "p": 4.8, "c": 21.6, "f": 2.4}, from: DESC,
        ingredients: [
          "150 g chana dal (Bengal gram lentils)", "100 g brown rice", "2 tbsp chilli-ginger paste", "2 dried red chillies",
          "¼ tsp turmeric powder", "1 tsp mustard seeds", "2 sprigs curry leaves", "1 tsp salt", "1 tsp fruit salt",
          "1 tsp ghee", "½ tsp oil, for greasing",
        ],
      },
      {
        name: "Besan Methi Idli", channel: "Good Food Kitchen", video: "https://www.youtube.com/watch?v=vc7qaOzl374", macros: {"na": "The creator doesn't give any quantities."}, from: DESC,
        ingredients: ["Besan (chickpea flour)", "Rava (semolina)", "Fresh fenugreek (methi) leaves"],
        note: "The creator doesn't list quantities. Watch the video for the amounts.",
      },
      {
        name: "Stuffed Paneer Masala Idli", channel: "Tasted Recipes", video: "https://www.youtube.com/watch?v=_s4sanm4JYU", macros: {"na": "The idli batter is only given as \"1 large bowl\", so the total can't be worked out."}, from: DESC,
        ingredients: [
          {
            title: "Paneer filling",
            items: [
              "2 tbsp edible oil", "1 medium onion, chopped", "1 tsp ginger-garlic paste", "½ small capsicum, chopped",
              "1 small bowl green garlic", "1 small bowl chopped coriander", "1 tsp garam masala", "1 tsp red chilli powder",
              "Salt, to taste", "½ small bowl tomato puree", "1 small bowl grated paneer",
            ],
          },
          { title: "Idli", items: ["1 large bowl idli batter", "1 sachet Eno powder", "1 tbsp water", "Oil, for greasing", "Cheese, for garnishing"] },
        ],
      },
      {
        name: "Sprouts Idli", channel: "Life in United Kingdom", video: "https://www.youtube.com/watch?v=b3kdocITjRM", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 13, "serving": "2 idlis", "basis": "assumed", "why": "Assumed: about 16 g of dry ingredients per idli (the average of Hebbar's idli recipes).", "kcal": 110.5, "p": 7.6, "c": 19.9, "f": 0.4}, from: DESC,
        ingredients: ["2 cups green moong (sprouted)", "1 tbsp salt", "2–3 curry leaves", "1 packet Eno / fruit salt"],
        note: "Needs an idli steamer.",
      },
      {
        name: "Instant Ragi Idli", channel: HK, video: "https://www.youtube.com/watch?v=ejCj0E3diSU", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 7.5, "serving": "2 idlis", "basis": "source", "why": "The page says it makes 15 idlis.", "kcal": 209.9, "p": 6.3, "c": 31.2, "f": 6.6},
        makes: "Makes 15 idlis", from: PAGE,
        ingredients: [
          "1 cup ragi flour", "1 cup rava (coarse)", "1 cup curd", "1 cup water", "2 tbsp oil", "1 tsp mustard seeds",
          "1 tsp chana dal", "1 tsp urad dal", "1 tsp cumin", "1 pinch hing", "2 tbsp cashews, chopped", "2 tbsp carrot, grated",
          "2 chillies, chopped", "1 tsp ginger paste", "A few curry leaves", "1 tsp salt", "2 tbsp coriander, chopped", "1 tsp Eno fruit salt",
        ],
      },
      {
        name: "Instant Oats Idli", channel: HK, video: "https://www.youtube.com/watch?v=OGVcPcfsUPA", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 7.5, "serving": "2 idlis", "basis": "source", "why": "The page says it makes 15 idlis.", "kcal": 121.3, "p": 3.9, "c": 17.9, "f": 3.8},
        makes: "Makes 15 idlis", from: PAGE,
        ingredients: [
          "1 cup rolled oats", "½ cup rava / semolina (coarse)", "½ cup curd / yogurt", "1 cup water", "3 tsp oil",
          "1 tsp mustard seeds", "½ tsp urad dal", "1 tsp chana dal", "½ tsp cumin (jeera)", "A few curry leaves",
          "½ tsp ginger paste", "2 chillies, finely chopped", "1 carrot, grated", "¼ tsp turmeric",
          "2 tbsp coriander, finely chopped", "¾ tsp salt", "7 cashews (halves)", "½ tsp Eno fruit salt",
        ],
      },
      {
        name: "Foxtail Millet Idli", channel: "WahRecipes", video: "https://www.youtube.com/watch?v=NMG8_wwlcRE", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 10, "serving": "2 idlis", "basis": "assumed", "why": "Assumed: about 16 g of dry ingredients per idli (the average of Hebbar's idli recipes).", "kcal": 115.3, "p": 4.7, "c": 21.7, "f": 1.0}, from: DESC,
        ingredients: [
          "1 cup foxtail millet (korralu), washed and soaked", "½ cup urad dal", "¼ cup flattened rice (poha)",
          "2 tsp fenugreek (methi) seeds", "Salt, as required",
        ],
      },
      {
        name: "Quinoa Idli", channel: "Chitra's Food Book", video: "https://www.youtube.com/watch?v=UdYZpQnIeAc", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 21, "serving": "2 idlis", "basis": "assumed", "why": "Assumed: about 16 g of dry ingredients per idli (the average of Hebbar's idli recipes).", "kcal": 116.5, "p": 4.6, "c": 21.7, "f": 1.1},
        from: "Chitra's Food Book recipe page",
        ingredients: ["2 cups quinoa", "1 cup idli rice (Salem rice)", "¾ cup white round urad dal", "Salt and water, as needed"],
        note: "The recipe measures 1 cup as 240 ml.",
      },
    ],
  },

  // ============================ DOSAS ============================
  {
    id: "dosas",
    title: "Dosas",
    note: "Healthy dosas made with dals, sprouts, millets and other grains. The dal and sprout dosas are the most protein-rich; the brown rice, millet and bajra dosas are lighter picks. Each dosa has its own video. The nutrition counts the dosa only (no chutney), and cooking oil only when the creator gives an amount.",
    recipes: [
      {
        name: "Pesarattu (Green Moong Dosa)", channel: HK,
        video: "https://www.youtube.com/watch?v=CL2vf1h1LU4", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "2 dosas", "basis": "source", "why": "The page says it makes 10 dosas.", "kcal": 181.4, "p": 11.3, "c": 33.2, "f": 0.8},
        makes: "Makes 10 dosas", from: PAGE,
        ingredients: [
          "1 cup moong dal",
          "2 tbsp chana dal",
          "2 tbsp rice",
          "Water, for soaking",
          "4 chillies",
          "2 inch ginger",
          "1 tsp cumin",
          "½ tsp salt",
          "Oil, for roasting",
          "Onion, for topping",
        ],
      },
      {
        name: "Moong Dal Dosa (Yellow Moong)", channel: "Khatri's Kitchen",
        video: "https://www.youtube.com/watch?v=4U2lFDChRP4", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 3, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 305.5, "p": 12.6, "c": 38.3, "f": 12.1},
        from: DESC,
        ingredients: [
          "150 g moong dal (1 cup)",
          "1 tsp salt",
          "2 tbsp rice flour",
          "2–3 tbsp oil, in total",
          "2 green chillies",
          "4 garlic cloves",
          "1 inch ginger",
          "2 tbsp fresh coriander",
          "Paneer, optional",
        ],
        note: "The description gives the moong dal as 1 cup (150 g). No amount is given for the optional paneer.",
      },
      {
        name: "Adai Dosa (Classic, with Rice)", channel: "HomeCookingShow",
        video: "https://www.youtube.com/watch?v=TURbxKNg6Hg", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 242.7, "p": 9.3, "c": 48.3, "f": 1.1},
        from: DESC,
        ingredients: [
          "¼ cup toor dal",
          "¼ cup urad dal",
          "¼ cup chana dal",
          "½ cup raw rice",
          "½ cup par-boiled rice",
          "8 red chillies",
          "Oil",
          "½ tsp mustard seeds",
          "½ tsp asafoetida powder",
          "Curry leaves",
          "Shallots",
          "Ginger",
          "¼ tsp turmeric powder",
          "Salt, to taste",
        ],
        note: "The description gives no amounts for the oil, curry leaves, shallots or ginger.",
      },
      {
        name: "Multi Dal Adai (No Rice)", channel: "Nayana's Veg Kitchen",
        video: "https://www.youtube.com/watch?v=lWAYBKH1EAY", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 4, "serving": "1 of the creator's 4 servings", "basis": "source", "why": "The creator gives these amounts for 4 people.", "kcal": 270.2, "p": 17.9, "c": 47.8, "f": 1.5},
        makes: "Serves 4", from: DESC,
        ingredients: [
          "1 cup moong dal",
          "¼ cup chana dal",
          "¼ cup urad dal",
          "1½ tsp salt",
          "½ tsp jeera",
          "¼ tsp hing",
          "1 green chilli",
        ],
        note: "The creator lists these amounts for 4 people.",
      },
      {
        name: "Protein Dosa (5 Dals & Oats, No Fermentation)", channel: "Diet Kundali",
        video: "https://www.youtube.com/watch?v=7qYYZlJymVs", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 6, "serving": "2 dosas", "basis": "source", "why": "The creator says it makes 12 dosas.", "kcal": 250.4, "p": 14.9, "c": 44.2, "f": 2.1},
        makes: "Makes 12 dosas", from: DESC,
        ingredients: [
          "70 g urad dal",
          "70 g chana dal",
          "70 g masoor dal",
          "70 g moong dal",
          "70 g toor (tuar) dal",
          "70 g rolled oats",
          "1 tsp methi dana (fenugreek seeds)",
          "Salt, to taste",
          "Water",
        ],
        note: "The creator says one dosa has about 116 kcal and 7.5 g of protein.",
      },
      {
        name: "Quinoa Adai Dosa (No Rice)", channel: "Masalachilli",
        video: "https://www.youtube.com/watch?v=DgvJ_Puh11c", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 10, "serving": "2 dosas", "basis": "source", "why": "The page says it makes 20 dosas.", "kcal": 240.7, "p": 14.1, "c": 42.2, "f": 2.1},
        makes: "Makes 20 dosas", from: CPAGE,
        ingredients: [
          "1 cup quinoa (1 cup is 250 ml)",
          "½ cup whole green moong",
          "½ cup split yellow moong dal",
          "½ cup horse gram (kollu)",
          "½ cup chana dal",
          "½ cup urad dal",
          "10 whole dry red chillies",
          "¼ tsp hing",
          "Salt, to taste",
          "Water, as needed to soak, grind and adjust the batter",
          "Sesame oil, to cook the dosa",
        ],
      },
      {
        name: "Ragi Adai (Dal Dosa with Ragi)", channel: "Bhusanur.cooking",
        video: "https://www.youtube.com/watch?v=aOnc0Hwm_5w", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 287.0, "p": 15.1, "c": 47.4, "f": 4.7},
        from: DESC,
        ingredients: [
          "½ cup ragi (finger millet)",
          "¼ cup urad dal",
          "¼ cup chana dal",
          "¼ cup toor dal",
          "¼ cup moong dal (yellow)",
          "¼ cup green gram",
          "1 tbsp flax seeds",
          "1 tbsp methi (fenugreek) seeds",
          "2 tbsp raw peanuts",
          "3 red chillies",
          "1 small piece ginger",
          "Salt, to taste",
          "Water, as needed for grinding",
          { title: "Chutney", items: ["¾ cup grated coconut", "1 tbsp roasted chana dal", "5 cashews", "2 green chillies", "1 small piece ginger", "Coriander leaves", "Small piece of tamarind", "Salt, to taste", "Water, for grinding", "For the tempering: 2 tsp oil, ½ tsp mustard seeds, 1 red chilli, curry leaves"] },
        ],
        note: "The nutrition counts the dosa only, not the chutney.",
      },
      {
        name: "Sprouted Wheat Dosa", channel: "Cook with Kushi",
        video: "https://www.youtube.com/watch?v=iXty1SbuYNE", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 4, "serving": "2 dosas", "basis": "source", "why": "The page says it makes 8 dosas.", "kcal": 242.1, "p": 11.9, "c": 48.8, "f": 1.1},
        makes: "Makes 8 dosas", from: CPAGE,
        ingredients: [
          "1 cup wheat",
          "½ cup urad dal (skinned black lentils)",
          "Salt, to taste",
          "Oil, for cooking the dosa",
        ],
      },
      {
        name: "Mixed Sprouts Dosa", channel: "Mahalaxmi Real Kitchen",
        video: "https://www.youtube.com/watch?v=OWZYjuO8XvU", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 4, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 204.7, "p": 11.1, "c": 38.1, "f": 1.0},
        from: DESC,
        ingredients: [
          "2 cups mixed sprouts",
          "½ cup rava",
          "¼ cup besan",
          "1 green chilli",
          "1 inch ginger",
          "1 tsp jeera",
          "Salt, to taste",
          { title: "To serve", items: ["Schezwan chutney", "Cheese", "Butter"] },
          { title: "Chutney", items: ["Grated fresh coconut", "Coriander leaves", "Green chilli", "Garlic", "Salt"] },
        ],
        note: "The creator lists the toppings and chutney without amounts, so the nutrition counts the dosa only.",
      },
      {
        name: "Instant Bajra Dosa (Pearl Millet, No Rice)", channel: "Healthy and Tasty Channel",
        video: "https://www.youtube.com/watch?v=T6mbUc4nMgA", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 2, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 271.8, "p": 8.9, "c": 51.4, "f": 3.3},
        from: DESC,
        ingredients: [
          "1 cup bajra (pearl millet) flour",
          "4 tbsp gram flour (besan)",
          "Curry leaves",
          "Cumin",
          "Coriander",
          "Green chillies",
          "Salt, to taste",
          "2 cups water, added gradually",
        ],
      },
      {
        name: "Bajra & Mixed Dal Dosa (No Fermentation)", channel: "Skinny Recipes",
        video: "https://www.youtube.com/watch?v=hLVttVABYQg", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 6, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 252.2, "p": 11.5, "c": 47.1, "f": 2.2},
        from: DESC,
        ingredients: [
          "1 cup bajra",
          "¼ cup tur (toor) dal",
          "¼ cup bengal gram",
          "¼ cup green mung dal",
          "¼ cup horse gram",
          "4–5 kashmiri chillies",
          "2 cups water",
          "1 tsp jeera",
          "Pink salt, as needed",
          "1 small piece ginger",
          "¼ tsp hing",
          "1 onion",
          "1 green chilli",
          "Coriander leaves",
          "Curry leaves",
          "Turmeric powder",
          "Black pepper powder",
          "Wood-pressed sesame oil or desi ghee, as needed",
        ],
        note: "The creator says to use 2 to 2½ cups of water.",
      },
      {
        name: "Foxtail Millet Dosa", channel: "Skinny Recipes",
        video: "https://www.youtube.com/watch?v=eTp5qDNc8ok", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 8, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 232.4, "p": 8.5, "c": 43.9, "f": 2.3},
        from: DESC,
        ingredients: [
          "2 cups foxtail millet (thena)",
          "½ cup urad dal",
          "1 heaped tbsp methi seeds",
          "1¼ cups water (up to 1½ cups, as needed)",
          "Salt, as needed",
        ],
      },
      {
        name: "Mixed Millet Dosa (4 Millets)", channel: "Pristine Organics",
        video: "https://www.youtube.com/watch?v=542bXYLt16A", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 220.6, "p": 9.1, "c": 41.1, "f": 2.0},
        from: DESC,
        ingredients: [
          "¼ cup foxtail millet",
          "¼ cup little millet",
          "¼ cup barnyard millet",
          "¼ cup kodo millet",
          "½ cup white whole urad dal",
          "½ tsp salt",
        ],
        note: "The creator says to grind with 1 cup of water, then add another cup to thin the batter.",
      },
      {
        name: "Multigrain Dosa (Ragi, Moong & Black Chana)", channel: "Yum Recipes Hut",
        video: "https://www.youtube.com/watch?v=_kztpIt_kK4", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 223.7, "p": 9.5, "c": 43.1, "f": 1.4},
        from: DESC,
        ingredients: [
          "½ cup rice",
          "¼ cup urad dal",
          "¼ cup ragi (finger millet)",
          "¼ cup green moong",
          "¼ cup black chana (kala chana)",
          "¼ cup poha",
          "½ tsp methi (fenugreek) seeds",
          "Water, as required",
          "Salt, to taste",
          { title: "Chutney", items: ["½ cup coconut", "2 tbsp roasted chana dal (putani)", "A handful of coriander leaves", "2 tbsp mint", "1 green chilli", "Small piece of tamarind (optional)", "Salt, to taste", "3 tbsp water, or as required", "For the tempering: 1 tsp coconut oil, ½ tsp mustard seeds, ½ tsp cumin seeds, 1 dry red chilli, curry leaves"] },
        ],
        note: "The nutrition counts the dosa only, not the chutney.",
      },
      {
        name: "Navadhanya Dosa (9-Grain & Dal)", channel: "Parmis Kitchen",
        video: "https://www.youtube.com/watch?v=Gvih6CyQ_I4", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 14, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 229.0, "p": 12.5, "c": 42.3, "f": 1.4},
        from: DESC,
        ingredients: [
          "½ cup moong dal",
          "1 cup brown rice",
          "½ cup black-eyed peas",
          "½ cup toor dal",
          "½ cup poha",
          "½ cup black gram",
          "½ cup chana dal",
          "½ cup urad dal",
          "½ cup green moong dal",
          "1 tsp salt",
          "¼ tsp baking soda",
        ],
        note: "The creator doesn't say how many dosas this makes.",
      },
      {
        name: "Brown Rice Dosa", channel: "Tulunadu Rasoi",
        video: "https://www.youtube.com/watch?v=eExQN0uh6K0", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 9, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 228.0, "p": 8.3, "c": 44.7, "f": 1.6},
        from: DESC,
        ingredients: [
          "2 cups brown rice",
          "1 cup urad dal",
        ],
        note: "The description lists only the rice and dal. The creator says to soak them for 7 to 8 hours.",
      },
      {
        name: "Little Millet & Sprouts Palak Dosa", channel: "Skinny Recipes",
        video: "https://www.youtube.com/watch?v=s9IdkWtyhA8", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "2 dosas (about 65 g of dry grain, flour and dal)", "basis": "assumed", "why": "Assumed: 2 dosas use about 65 g of dry ingredients (the average of the dosa recipes here that state how many they make).", "kcal": 203.3, "p": 10.7, "c": 37.9, "f": 1.3},
        from: CPAGE,
        ingredients: [
          "3 cups moong sprouts",
          "½ cup little millet",
          "1 cup water",
          "A handful of palak (spinach) leaves",
          "2 sprigs curry leaves",
          "A handful of shallots",
          "½ inch ginger",
          "2 green chillies",
          "1 tsp cumin seeds",
          "⅓ tsp black peppercorns",
          "1 tsp sea salt",
          "Wood-pressed oil, for greasing and for the dosa",
        ],
        note: "No amounts are given for the palak or shallots.",
      },
    ],
  },
  // ============================ SALADS ============================
  {
    id: "salads",
    title: "Salads",
    note: "The Indian-style salads come first: sprout, chana, rajma and paneer salads carry the most protein, and kosambari adds moong dal. After them are the vegetarian salads from the Goddess of Salads channel, mostly Mediterranean-style with yogurt or olive-oil dressings. The chickpea and bean ones have the most protein.",
    recipes: [
      {
        name: "Sprouts Salad", channel: HK, video: "https://www.youtube.com/watch?v=bFaroURuPV8", meals: {"breakfast": "side", "lunch": "side", "dinner": "side"}, macros: {"servings": 2, "serving": "1 bowl (about 200 g of salad)", "basis": "assumed", "why": "Assumed: a bowl of salad is about 200 g.", "kcal": 185.2, "p": 10.6, "c": 27.2, "f": 5.1}, from: PAGE,
        ingredients: [
          "1 cup moong sprouts", "3 cups hot water", "½ tsp cumin powder", "¼ tsp Kashmiri red chilli powder",
          "½ tsp aamchur (dry mango powder)", "¼ tsp salt", "½ cucumber, chopped", "½ tomato, chopped", "½ carrot, grated",
          "2 tbsp capsicum, chopped", "2 tbsp spring onion, chopped", "2 tbsp coriander, finely chopped",
          "2 tbsp mint (pudina), finely chopped", "1 chilli, finely chopped", "1 tsp lemon juice", "2 tbsp peanuts, roasted and crushed",
        ],
      },
      {
        name: "Protein Salad (Sprouted Kala Chana, Moong & Paneer)", channel: "Sanjeev Kapoor Khazana",
        video: "https://www.youtube.com/watch?v=TKEgCMyU65Q", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 4, "serving": "1 bowl (about 200 g of salad)", "basis": "assumed", "why": "Assumed: a bowl of salad is about 200 g.", "kcal": 339.1, "p": 21.0, "c": 25.8, "f": 18.9}, from: DESC,
        ingredients: [
          "1 cup kala chana (black chickpeas), sprouted", "¾ cup green moong, sprouted", "200 g paneer (cottage cheese), in small cubes",
          "1 medium onion, finely chopped", "1 medium tomato, finely chopped",
          "2 tbsp fresh coriander leaves, chopped, plus more for garnish", "¼ cup roasted skinless peanuts, plus more for garnish",
          "1 tbsp raw mango, chopped, plus more for garnish", "Black salt, to taste", "2 tsp roasted cumin powder",
          "2–3 green chillies, chopped", "¼ tsp black pepper powder", "½ tsp chaat masala", "1 lemon, cut in half",
        ],
      },
      {
        name: "Kosambari (Moong Dal & Cucumber Salad)", channel: "Healthy Rasoi by Ritu Khemka",
        video: "https://www.youtube.com/watch?v=A2ULKh7gg3c", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 2, "serving": "1 bowl (about 200 g of salad)", "basis": "assumed", "why": "Assumed: a bowl of salad is about 200 g.", "kcal": 220.1, "p": 7.7, "c": 25.9, "f": 10.7}, from: DESC,
        ingredients: [
          {
            title: "Salad",
            items: [
              "¼ cup moong dal, washed and soaked for 2 hours", "1 cup cucumber, chopped", "½ cup carrot, in juliennes",
              "½ cup purple cabbage (optional)", "¼ cup red bell pepper (optional)", "3 tbsp coriander leaves, chopped",
              "¼ cup fresh grated coconut", "1–2 green chillies, sliced", "1 inch ginger, minced", "Lemon juice (amount not given)",
              "1 tsp salt, or as required", "¼ tsp black pepper", "¼ tsp sugar (optional)",
            ],
          },
          { title: "Tadka", items: ["1 tbsp oil", "1 pinch hing", "½ tsp mustard seeds", "8–10 curry leaves"] },
        ],
      },
      {
        name: "Kala Chana Chaat", channel: "She Cooks", video: "https://www.youtube.com/watch?v=bQJd4m6POck", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 4, "serving": "1 bowl (about 50 g of dry kala chana)", "basis": "assumed", "why": "Assumed: about 50 g of dry chickpeas per bowl, since they swell when cooked.", "kcal": 227.7, "p": 10.5, "c": 32.4, "f": 6.9}, from: DESC,
        ingredients: [
          "1 cup kala chana (black chickpeas)", "1 tbsp oil", "½ tsp chana dal", "½ tsp urad dal", "½ tsp mustard seeds",
          "¼ tsp cumin seeds", "1 tsp chopped ginger", "¼ tsp asafoetida (hing)", "3 green chillies", "1 red chilli",
          "1 sprig curry leaf", "¼ tsp turmeric powder", "1 tbsp grated coconut", "Salt",
        ],
      },
      {
        name: "Rajma Paneer Salad", channel: "Vaishalee Jolly", video: "https://www.youtube.com/watch?v=qGoAgbUwPCE", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 3, "serving": "1 bowl (about 200 g of salad)", "basis": "assumed", "why": "Assumed: a bowl of salad is about 200 g.", "kcal": 252.0, "p": 12.9, "c": 24.3, "f": 12.8}, from: DESC,
        ingredients: [
          "1 cup rajma (pressure cooked for 30 minutes)", "¾ cup paneer, chopped", "½ cup grated carrots", "½ cup grated beetroot",
          "1 small green apple", "2 tbsp vinegar", "1 tbsp extra virgin olive oil", "¼ tsp black pepper", "¼ tsp mustard sauce",
          "¼ tsp garlic powder", "½ tsp sugar", "Salt, to taste",
        ],
      },
      {
        name: "Paneer Salad", channel: "Dindigul Food Court", video: "https://www.youtube.com/watch?v=DjIh2aF5lh0", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 3, "serving": "1 bowl (about 200 g of salad)", "basis": "assumed", "why": "Assumed: a bowl of salad is about 200 g.", "kcal": 261.2, "p": 17.2, "c": 8.4, "f": 19.5}, from: DESC,
        ingredients: [
          "1 tsp oil", "200 g paneer", "½ tsp chilli powder", "¼ tsp oregano", "2 tbsp curd", "1 garlic clove", "½ tsp chilli flakes",
          "¼ tsp pepper", "Salt", "1 tsp lemon juice", "½ cup grated carrot", "½ cup grated cucumber", "½ onion", "1 tomato",
        ],
      },
      {
        name: "Sweet Corn Salad", channel: "Dindigul Food Court", video: "https://www.youtube.com/watch?v=y4jb7Gyf6fA", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 5, "serving": "1 bowl (about 200 g of salad)", "basis": "assumed", "why": "Assumed: a bowl of salad is about 200 g.", "kcal": 104.5, "p": 3.9, "c": 23.2, "f": 1.4}, from: DESC,
        ingredients: [
          "3 cups sweet corn", "1 cucumber", "1 tomato", "½ capsicum", "1 onion", "1 carrot, grated", "Coriander leaves (amount not given)",
          "½ tsp chilli powder", "½ tsp pepper", "½ tsp chaat masala", "Juice of ½ lemon", "Salt",
        ],
      },
      {
        name: "Kachumber Salad", channel: "Bhavna's Kitchen & Living", video: "https://www.youtube.com/watch?v=bmAggasY6ls", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 4, "serving": "1 bowl (about 200 g of salad)", "basis": "assumed", "why": "Assumed: a bowl of salad is about 200 g.", "kcal": 46.2, "p": 1.7, "c": 10.6, "f": 0.3}, from: DESC,
        ingredients: [
          "1 medium onion, finely chopped", "1 cucumber, finely chopped", "2 medium tomatoes, finely chopped", "1 medium carrot, shredded",
          "1 small beetroot, shredded", "1 tsp roasted cumin powder", "½ medium lemon, juiced", "1 pinch salt (to taste)",
          "3 tbsp cilantro leaves, finely chopped", "1 pinch red chilli powder (to taste)", "1 tbsp lemon zest",
        ],
      },
      {
        name: "Cabbage, Carrot & Apple Salad (Sesame Dressing)", channel: "Goddess of Salads",
        video: "https://www.youtube.com/watch?v=CBOSgf0YsaU", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 2.5, "serving": "1 of the creator's 2 to 3 servings", "basis": "source", "why": "The creator says it serves 2 to 3; I used 2.5.", "kcal": 387.9, "p": 7.0, "c": 44.3, "f": 22.8},
        makes: "Serves 2–3", from: DESC,
        ingredients: [
          { title: "Salad", items: ["300 g cabbage", "Salt", "1 carrot", "1 cucumber", "1 red onion", "10 g green onion", "10 g parsley", "1 green apple", "White sesame seeds", "Black sesame seeds", "Flax seeds", "20 g almond flakes", "Pepper mix"] },
          { title: "Dressing", items: ["30 g avocado oil (2 tbsp)", "1⅓ tbsp water (20 ml)", "1 tsp ground flax seeds (2.5 g)", "2 tbsp rice vinegar", "2 tbsp soy sauce", "1 tbsp sesame oil", "1 tbsp honey", "2 garlic cloves", "Ginger", "Chili flakes"] },
        ],
        note: "The creator lists about 120 kcal per 100 g for the finished salad; counting only the listed ingredients I get about 90 kcal per 100 g.",
      },
      {
        name: "Beetroot, White Bean & Walnut Salad (Tahini Dressing)", channel: "Goddess of Salads",
        video: "https://www.youtube.com/watch?v=19zzRY4MIz4", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 2.5, "serving": "1 of the creator's 2 to 3 servings", "basis": "source", "why": "The creator says it serves 2 to 3; I used 2.5.", "kcal": 415.0, "p": 9.1, "c": 39.2, "f": 27.2},
        makes: "Serves 2–3", from: DESC,
        ingredients: [
          { title: "Salad", items: ["1 red onion", "1 beetroot", "150 g canned white beans", "10 g parsley", "20 g walnuts", "80 g green olives", "100 g pomegranate seeds", "20 g capers"] },
          { title: "Dressing", items: ["20 g tahini (1⅓ tbsp)", "1 tbsp honey", "1 tsp grainy mustard", "Italian herbs", "Salt", "2 garlic cloves", "Juice of ½ lemon", "Pepper mix", "Dried onion", "30 g avocado oil (2 tbsp)"] },
        ],
        note: "The creator's list says \"canned beans\"; the video description calls them white beans. The creator lists about 173 kcal per 100 g for the finished salad; counting only the listed ingredients I get about 168 kcal per 100 g.",
      },
      {
        name: "Mediterranean Chickpea Salad (Avocado & Walnut)", channel: "Goddess of Salads",
        video: "https://www.youtube.com/watch?v=hzaQWfhjXiM", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 2.5, "serving": "1 of the creator's 2 to 3 servings", "basis": "source", "why": "The creator says it serves 2 to 3; I used 2.5.", "kcal": 481.2, "p": 11.8, "c": 45.0, "f": 31.3},
        makes: "Serves 2–3", from: DESC,
        ingredients: [
          { title: "Salad", items: ["2 tomatoes", "1 cucumber", "1 bell pepper", "1 red onion", "1 avocado", "10 g parsley", "15 g walnuts", "200 g boiled chickpeas"] },
          { title: "Dressing", items: ["40 g olive oil (2⅔ tbsp)", "1 tbsp pomegranate vinegar", "1 tsp Dijon mustard", "1 tsp maple syrup", "Dried mint", "Sumac", "Dried garlic", "Salt", "Pepper mix", "Juice of 1 lime"] },
        ],
        note: "The creator lists about 121 kcal per 100 g for the finished salad; counting only the listed ingredients I get about 100 kcal per 100 g.",
      },
      {
        name: "Cabbage, Avocado & Apple Salad (Yogurt Dressing)", channel: "Goddess of Salads",
        video: "https://www.youtube.com/watch?v=PemM5O5gF64", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 2.5, "serving": "1 of the creator's 2 to 3 servings", "basis": "source", "why": "The creator says it serves 2 to 3; I used 2.5.", "kcal": 297.7, "p": 10.6, "c": 35.8, "f": 15.3},
        makes: "Serves 2–3", from: DESC,
        ingredients: [
          { title: "Salad", items: ["200 g cabbage", "Salt", "1 cucumber", "1 green apple", "10 g green onion", "10 g dill", "10 g parsley", "½ avocado", "150 g green peas"] },
          { title: "Dressing", items: ["80 g yogurt (5⅓ tbsp)", "1 tsp grainy mustard", "1 tsp maple syrup", "Parsley", "Dill", "Salt", "Lemon zest", "Pepper mix", "25 g pumpkin seeds", "½ avocado", "Juice of ½ lemon"] },
        ],
        note: "The creator lists ½ an avocado in the salad and ½ an avocado in the dressing. The creator lists about 111 kcal per 100 g for the finished salad; counting only the listed ingredients I get about 69 kcal per 100 g.",
      },
      {
        name: "Beetroot, Apple & Carrot Cabbage Salad (Citrus Dressing)", channel: "Goddess of Salads",
        video: "https://www.youtube.com/watch?v=GOH5o1B-O4c", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 2.5, "serving": "1 of the creator's 2 to 3 servings", "basis": "source", "why": "The creator says it serves 2 to 3; I used 2.5.", "kcal": 366.0, "p": 6.1, "c": 39.2, "f": 23.3},
        makes: "Serves 2–3", from: DESC,
        ingredients: [
          { title: "Salad", items: ["300 g cabbage", "Salt", "1 carrot", "1 boiled beetroot", "5 g parsley", "15 g pumpkin seeds", "1 apple", "100 g pomegranate seeds", "10 g walnuts"] },
          { title: "Dressing", items: ["40 g olive oil (2⅔ tbsp)", "20 g water (1⅓ tbsp)", "1 tsp Dijon mustard", "5 g ground flax seeds (1 tsp)", "Cardamom", "30 g pomegranate vinegar (2 tbsp)", "1 tbsp honey", "Dried garlic", "Salt", "Orange zest", "Juice of ½ orange", "Pepper mix"] },
        ],
        note: "The creator lists about 122 kcal per 100 g for the finished salad; counting only the listed ingredients I get about 112 kcal per 100 g.",
      },
      {
        name: "Cabbage, Carrot & Apple Salad (Creamy Yogurt Dressing)", channel: "Goddess of Salads",
        video: "https://www.youtube.com/watch?v=7-DA7htZpkU", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 2.5, "serving": "1 of the creator's 2 to 3 servings", "basis": "source", "why": "The creator says it serves 2 to 3; I used 2.5.", "kcal": 261.8, "p": 4.4, "c": 34.5, "f": 13.4},
        makes: "Serves 2–3", from: DESC,
        ingredients: [
          { title: "Salad", items: ["400 g cabbage", "Salt", "1 carrot", "1 red onion", "Green onion", "Parsley", "1 green apple", "A mix of flax, sunflower, pumpkin and sesame seeds", "Pepper mix"] },
          { title: "Dressing", items: ["80 g yogurt (5⅓ tbsp)", "Parsley", "30 g olive oil (2 tbsp)", "1 tsp grainy mustard", "Ground flax seeds", "1 tbsp rice vinegar", "1 tbsp maple syrup", "Dried garlic", "Salt"] },
        ],
        note: "The creator gives no amounts for the seed mix, onion greens or parsley. The creator lists about 75 kcal per 100 g for the finished salad; counting only the listed ingredients I get about 76 kcal per 100 g.",
      },
      {
        name: "Crispy Smashed Potato Salad (American Style)", channel: "Goddess of Salads",
        video: "https://www.youtube.com/watch?v=oFQ1yJOKh0M", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 2.5, "serving": "1 of the creator's 2 to 3 servings", "basis": "source", "why": "The creator says it serves 2 to 3; I used 2.5.", "kcal": 311.6, "p": 6.8, "c": 59.0, "f": 6.6},
        makes: "Serves 2–3", from: DESC,
        ingredients: [
          { title: "Salad", items: ["600 g boiled potatoes", "Herbes de Provence", "Dried garlic", "Salt", "Pepper mix", "1 cucumber", "60 g pickled cucumber", "1 red onion", "7 g green onion"] },
          { title: "Dressing", items: ["60 g yogurt (4 tbsp)", "1 tsp grainy mustard", "1 tbsp red wine vinegar", "1 tbsp olive oil", "5 g dill", "Oregano", "Turmeric", "Dried garlic", "Salt", "Pepper mix"] },
        ],
        note: "The creator roasts the potatoes but lists no oil for that, so none is counted. The creator lists about 74 kcal per 100 g for the finished salad; counting only the listed ingredients I get about 68 kcal per 100 g.",
      },
      {
        name: "Italian Cabbage & Chickpea Salad (Mozzarella)", channel: "Goddess of Salads",
        video: "https://www.youtube.com/watch?v=IjfVbP_skcw", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 4, "serving": "1 of the creator's 3 to 5 servings", "basis": "source", "why": "The creator says it serves 3 to 5; I used 4.", "kcal": 395.6, "p": 14.0, "c": 35.7, "f": 23.8},
        makes: "Serves 3–5", from: DESC,
        ingredients: [
          { title: "Salad", items: ["350 g white cabbage", "1 cucumber", "200 g tomatoes", "1 bell pepper", "1 red onion", "100 g olives", "100 g mozzarella cheese", "250 g cooked chickpeas", "10 g parsley"] },
          { title: "Dressing", items: ["50 g olive oil (3⅓ tbsp)", "20 g water (1⅓ tbsp)", "1 tsp grainy mustard", "Oregano", "Turmeric", "1 tbsp red wine vinegar", "1 garlic clove", "15 g honey", "Salt", "Pepper mix"] },
        ],
        note: "The creator lists about 98 kcal per 100 g for the finished salad; counting only the listed ingredients I get about 99 kcal per 100 g.",
      },
    ],
  },

  // ============================ POHA ============================
  {
    id: "poha",
    title: "Poha",
    note: "Classic poha dishes first, then healthier takes: sprout, paneer, jowar and red rice poha, plus poha uttapam, idli and a steamed no-oil snack.",
    recipes: [
      {
        name: "Indori Poha", channel: HK, video: "https://www.youtube.com/watch?v=Q4ROqRnYz8w", meals: {"breakfast": "main"}, macros: {"servings": 5, "serving": "1 plate (1 of the page's 5 servings)", "basis": "source", "why": "The page says it serves 5.", "kcal": 202.7, "p": 3.9, "c": 26.8, "f": 9.4}, makes: "Serves 5", from: PAGE,
        ingredients: [
          {
            title: "Homemade Indori spice masala",
            items: [
              "2 tsp coriander seeds", "2 tsp cumin seeds", "2 tsp fennel seeds", "½ tsp pepper", "½ tsp cloves", "1 inch cinnamon",
              "½ nutmeg", "2 bay leaves", "2 tsp chilli powder", "½ tsp turmeric", "2 tsp aamchur", "1 tsp kala namak", "1 pinch hing",
              "2 tsp sugar", "½ tsp salt",
            ],
          },
          { title: "Poha", items: ["2 cups poha (thick)", "Water, for rinsing", "¼ tsp turmeric", "2 tbsp sugar", "1 tsp salt"] },
          {
            title: "Tempering",
            items: [
              "2 tbsp oil", "¼ cup peanuts", "1 tbsp mustard seeds", "1 tbsp cumin", "½ tbsp fennel", "1 pinch hing", "A few curry leaves",
              "3 chillies, finely chopped", "¼ tsp turmeric", "¼ cup milk", "A few coriander leaves, chopped",
            ],
          },
          { title: "To serve", items: ["Boondi", "Onion", "Ratlami sev", "Peanuts", "Coriander", "Lemon"] },
        ],
      },
      {
        name: "Kanda Poha (Aloo Kanda Pohe)", channel: HK, video: "https://www.youtube.com/watch?v=-ttCDDBXX4I", meals: {"breakfast": "main"}, macros: {"servings": 2, "serving": "1 plate (1 of the page's 2 servings)", "basis": "source", "why": "The page says it serves 2.", "kcal": 536.4, "p": 10.2, "c": 85.4, "f": 18.3}, makes: "Serves 2", from: PAGE,
        ingredients: [
          "2½ cups poha", "2 tbsp oil", "2 tbsp peanuts", "1 potato, chopped", "½ tsp mustard seeds", "½ tsp cumin", "1 pinch hing",
          "2 chillies, finely chopped", "1 inch ginger, finely chopped", "A few curry leaves", "1 onion, finely chopped", "½ tsp turmeric",
          "1 tsp salt", "1 tsp sugar", "½ lemon", "2 tbsp coriander, finely chopped",
        ],
      },
      {
        name: "Dadpe Pohe (No-Cook Poha)", channel: "Healthy Rasoi by Ritu Khemka",
        video: "https://www.youtube.com/watch?v=9hZZ8JtirWM", meals: {"breakfast": "main"}, macros: {"servings": 2, "serving": "1 plate (about 40 g of dry poha)", "basis": "assumed", "why": "Assumed: a plate of poha uses about 40 g dry.", "kcal": 444.5, "p": 9.0, "c": 47.7, "f": 25.9}, from: DESC,
        ingredients: [
          {
            title: "Poha",
            items: [
              "1½ cups thin poha (flattened rice)", "¼ cup coconut water or regular water", "1 medium onion, finely chopped",
              "¼ cup grated fresh or frozen coconut", "1 tsp salt", "1 tsp sugar", "Juice of half a lemon", "¼ cup coriander leaves, chopped",
            ],
          },
          {
            title: "Tadka",
            items: ["1–2 tbsp oil", "1 pinch hing (asafoetida)", "½ tsp mustard seeds", "½ tsp cumin seeds", "¼ cup peanuts", "2–3 green chillies, sliced", "A few curry leaves"],
          },
        ],
      },
      {
        name: "Vegetable Poha", channel: "Your Food Lab", video: "https://www.youtube.com/watch?v=yWkF-2aBDZE", meals: {"breakfast": "main"}, macros: {"servings": 5, "serving": "1 plate (about 40 g of dry poha)", "basis": "assumed", "why": "Assumed: a plate of poha uses about 40 g dry.", "kcal": 275.3, "p": 6.4, "c": 43.5, "f": 9.3}, from: DESC,
        ingredients: [
          {
            title: "Soaking and vegetables",
            items: [
              "3 cups poha", "1 medium onion", "1 medium potato", "A handful of French beans", "½ capsicum", "½ carrot",
              "⅓ cup sweet corn", "⅓ cup green peas",
            ],
          },
          {
            title: "Tempering and cooking",
            items: [
              "2 tbsp oil", "½ tsp cumin seeds", "½ tsp mustard seeds", "15 curry leaves", "3 green chillies, diced",
              "¼ cup peanuts (optional)", "A splash of water", "Salt, to taste", "½ tsp turmeric powder", "Juice of 1 lemon",
              "1 tsp sugar", "A handful of fresh coriander, chopped", "Extra salt and sugar, if required", "A splash of hot water",
            ],
          },
        ],
      },
      {
        name: "Mixed Sprouts Poha", channel: "Tarla Dalal", video: "https://www.youtube.com/watch?v=Y-cZpF-M2lM", meals: {"breakfast": "main"}, macros: {"servings": 2, "serving": "1 plate (about 40 g of dry poha)", "basis": "assumed", "why": "Assumed: a plate of poha uses about 40 g dry.", "kcal": 369.2, "p": 14.1, "c": 73.5, "f": 2.9}, from: DESC,
        ingredients: [
          "1½ cups beaten rice (poha)", "1½ cups boiled mixed sprouts", "1 tsp oil", "½ tsp mustard seeds", "½ cup finely chopped onions",
          "1 tbsp finely chopped green chillies", "½ tsp turmeric powder", "1 tbsp sugar", "Salt, to taste", "1 tbsp lemon juice",
          "1 tbsp finely chopped coriander, for garnish",
        ],
      },
      {
        name: "Paneer Poha", channel: "Cooking Recipe with Meena", video: "https://www.youtube.com/watch?v=CtP1WWq-3Hg", meals: {"breakfast": "main"}, macros: {"servings": 2, "serving": "1 plate (about 40 g of dry poha)", "basis": "assumed", "why": "Assumed: a plate of poha uses about 40 g dry.", "kcal": 542.0, "p": 17.1, "c": 36.0, "f": 38.8}, from: DESC,
        ingredients: [
          "1 cup flattened rice (poha)", "100 g paneer", "8–10 cashew nuts", "1 tbsp peanuts", "1 tsp mustard seeds", "1 tsp cumin seeds",
          "2 green chillies, finely chopped", "1 large onion, chopped", "8–10 curry leaves", "1 tsp coriander leaves", "¼ tsp turmeric powder",
          "1 tsp sugar (optional)", "Salt, to taste", "3 tbsp lemon juice", "3 tbsp cooking oil", "Aloo bhujiya or sev, for garnish",
        ],
      },
      {
        name: "Jowar Poha (Millet Flakes)", channel: "Bhusanur.cooking", video: "https://www.youtube.com/watch?v=3QFlUBJXX98", meals: {"breakfast": "main"}, macros: {"servings": 3, "serving": "1 plate (about 40 g of dry jowar flakes)", "basis": "assumed", "why": "Assumed: a plate of poha uses about 40 g dry.", "kcal": 262.7, "p": 7.2, "c": 37.9, "f": 11.4}, from: DESC,
        ingredients: [
          "1¼ cups jowar (millet) flakes", "1 tbsp oil", "½ tsp mustard seeds", "¼ tsp jeera (cumin) seeds", "1 tsp chana dal", "1 tsp urad dal",
          "2 tbsp raw peanuts", "1 onion, chopped", "2 green chillies, chopped", "A few curry leaves", "½ tsp sugar", "Salt, to taste",
          "Juice of ½ lemon", "2 tbsp coriander leaves", "4 tbsp grated fresh coconut",
        ],
      },
      {
        name: "Red Rice Poha", channel: "Gita's Kitchen", video: "https://www.youtube.com/watch?v=MDaWNfeCU0E", meals: {"breakfast": "main"}, macros: {"servings": 3, "serving": "1 plate (about 40 g of dry poha)", "basis": "assumed", "why": "Assumed: a plate of poha uses about 40 g dry.", "kcal": 314.1, "p": 7.2, "c": 49.0, "f": 11.3}, from: DESC,
        ingredients: [
          "2 cups red poha", "1 tbsp oil", "1 onion", "2 green chillies", "A few curry leaves", "A few coriander leaves", "2 tbsp raw mango, chopped",
          "1 tbsp frozen green peas", "1 tsp cumin seeds", "¼ cup dry roasted peanuts", "1 cup pomegranate", "Salt, to taste",
          "1 pinch turmeric powder", "1 pinch black salt", "⅛ tsp chilli powder", "½ tsp roasted cumin powder", "Lemon juice (amount not given)",
        ],
      },
      {
        name: "Poha Uttapam", channel: HK, video: "https://www.youtube.com/watch?v=cdyDu70rstw", meals: {"breakfast": "main"}, macros: {"servings": 4.5, "serving": "2 uttapams", "basis": "source", "why": "The page says it makes 9 uttapams.", "kcal": 117.8, "p": 4.2, "c": 22.7, "f": 1.1}, makes: "Makes 9 uttapams", from: PAGE,
        ingredients: [
          "½ cup poha / aval / beaten rice (thick)", "½ cup rava / semolina (fine)", "½ cup water", "½ cup curd / yogurt", "½ tsp salt",
          "½ onion, finely chopped", "5 beans, finely chopped", "½ carrot, finely chopped", "½ capsicum, finely chopped",
          "2 tbsp coriander, finely chopped", "¼ tsp salt", "Chilli flakes, for sprinkling", "Oil, for roasting",
        ],
      },
      {
        name: "Poha Suji Nasta (Steamed Vada, No Oil)", channel: HK, video: "https://www.youtube.com/watch?v=3pTUKnMGTLk", meals: {"breakfast": "main"}, macros: {"servings": 3, "serving": "1 portion (about 50 g of dry poha and rava)", "basis": "assumed", "why": "Assumed: about 50 g of dry poha and rava per portion.", "kcal": 216.6, "p": 7.7, "c": 39.4, "f": 2.9}, from: PAGE,
        ingredients: [
          "1 cup poha", "½ cup rava / suji", "1 tsp cumin", "¾ tsp salt", "1 cup curd", "½ cup water", "2 tbsp coriander, chopped",
          "1 chilli, chopped", "A few curry leaves, chopped", "1 pinch hing", "½ tsp chilli flakes",
        ],
      },
      {
        name: "Instant Poha Idli", channel: HK, video: "https://www.youtube.com/watch?v=ZHMT2ETbbs0", meals: {"breakfast": "main"}, macros: {"servings": 10, "serving": "2 idlis", "basis": "source", "why": "The page says it makes 20 idlis.", "kcal": 128.0, "p": 3.1, "c": 26.1, "f": 1.0}, makes: "Makes 20 idlis", from: PAGE,
        ingredients: [
          "1 cup poha / aval (thick)", "1 cup curd", "1½ cups rice rava / idli rava", "¾ tsp salt", "2 cups water (as required)", "¾ tsp Eno / fruit salt",
        ],
      },
    ],
  },

  // ============================ OATS ============================
  {
    id: "oats",
    title: "Oats",
    note: "Savory meals, a protein-boosted option (the oats and sprouts roti) and a few lighter sweet ones. The oats idli is in the Idlis section.",
    recipes: [
      {
        name: "Masala Oats", channel: HK, video: "https://www.youtube.com/watch?v=8Ohp-Pfck4M", meals: {"breakfast": "main"}, macros: {"servings": 2, "serving": "1 bowl (1 of the page's 2 servings)", "basis": "source", "why": "The page says it serves 2.", "kcal": 305.9, "p": 7.5, "c": 35.8, "f": 15.7}, makes: "Serves 2", from: PAGE,
        ingredients: [
          "1 cup rolled oats", "3 cups water", "2 tbsp ghee", "1 bay leaf", "1 tsp cumin", "4 pods cardamom", "½ tsp cloves", "1 inch cinnamon",
          "½ onion, finely chopped", "2 chillies", "½ carrot, chopped", "5 beans, chopped", "2 tbsp peas", "½ tomato, chopped", "½ tsp turmeric",
          "1 tsp chilli powder", "1 tsp coriander powder", "½ tsp cumin powder", "1 tsp pav bhaji masala", "½ tsp salt", "1 cup palak (spinach), chopped",
          "2 tsp lemon juice", "2 tbsp coriander, chopped",
        ],
      },
      {
        name: "Oats Khichdi", channel: HK, video: "https://www.youtube.com/watch?v=Bj_unN88GxQ", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 2, "serving": "1 bowl (about 100 g of dry rice or grain and dal)", "basis": "assumed", "why": "Assumed: about 100 g of dry grain and dal per bowl.", "kcal": 496.4, "p": 19.9, "c": 70.9, "f": 16.3}, from: PAGE,
        ingredients: [
          "1 cup rolled oats", "½ cup moong dal, soaked 20 minutes", "4 cups water", "2 tbsp ghee", "1 tsp cumin", "1 bay leaf", "1 pinch hing",
          "½ onion, finely chopped", "1 tsp ginger-garlic paste", "1 chilli, slit", "1 tomato, chopped", "4 beans, chopped", "3 tbsp peas",
          "1 carrot, chopped", "½ tsp turmeric", "½ tsp chilli powder", "1 tsp salt", "2 tbsp coriander, chopped",
        ],
      },
      {
        name: "Oats Upma", channel: "Sanjeev Kapoor Khazana", video: "https://www.youtube.com/watch?v=3MSQ6Oro8C4", meals: {"breakfast": "main"}, macros: {"servings": 3, "serving": "1 plate (about 50 g of dry grain)", "basis": "assumed", "why": "Assumed: about 50 g of dry grain per plate.", "kcal": 250.4, "p": 7.1, "c": 35.0, "f": 9.6}, from: DESC,
        ingredients: [
          "1½ cups oats", "1 medium onion, finely chopped", "1 medium tomato, chopped", "2 green chillies, roughly chopped",
          "3–4 fresh coriander sprigs, chopped", "1½ tbsp oil", "1 tsp mustard seeds", "1 tsp split skinless black gram (dhuli urad dal)",
          "¼ tsp asafoetida", "Salt, to taste", "¼ cup frozen green peas", "A pinch of sugar", "Fresh coriander sprig, for garnishing",
          "Lemon wedges, for garnishing", "Green coconut chutney, for serving",
        ],
      },
      {
        name: "Oats Chilla", channel: HK, video: "https://www.youtube.com/watch?v=3-9mvrQOHI0", meals: {"breakfast": "main"}, macros: {"servings": 6, "serving": "1 of the page's 6 servings", "basis": "source", "why": "The page says it serves 6.", "kcal": 72.1, "p": 2.6, "c": 12.6, "f": 1.3}, makes: "Serves 6", from: PAGE,
        ingredients: [
          "1 cup rolled oats", "2 tbsp rava / semolina (fine)", "¼ cup curd / yogurt", "1 cup water", "¼ tsp turmeric", "½ tsp ginger paste",
          "2 chillies, finely chopped", "½ tsp cumin / jeera (crushed)", "2 tbsp onion, finely chopped", "2 tbsp tomato, finely chopped",
          "½ tsp salt", "Olive oil, for roasting",
        ],
      },
      {
        name: "Instant Oats Dosa", channel: HK, video: "https://www.youtube.com/watch?v=uRCQPcvPoe4", meals: {"breakfast": "main"}, macros: {"servings": 6, "serving": "about 50 g of the dry batter ingredients (roughly 2 dosas or 1 omelette)", "basis": "assumed", "why": "Assumed: about 50 g of dry flour and dal per serving.", "kcal": 176.3, "p": 4.3, "c": 36.2, "f": 1.3}, from: PAGE,
        ingredients: [
          "1 cup rolled oats", "1 cup rice flour", "¼ cup rava / semolina / suji (coarse)", "1 tsp salt", "4 cups water", "½ onion, finely chopped",
          "2 chillies, finely chopped", "2 tbsp coriander, finely chopped", "2 tbsp curry leaves, chopped", "1 tsp cumin",
        ],
      },
      {
        name: "Eggless Oats Omelette", channel: HK, video: "https://www.youtube.com/watch?v=QkkTH5U88Nk", meals: {"breakfast": "main"}, macros: {"servings": 3, "serving": "about 50 g of the dry batter ingredients (roughly 2 dosas or 1 omelette)", "basis": "assumed", "why": "Assumed: about 50 g of dry flour and dal per serving.", "kcal": 213.7, "p": 8.4, "c": 38.2, "f": 3.2}, from: PAGE,
        ingredients: [
          "1 cup rolled oats", "¼ cup rava / semolina (coarse)", "¼ cup besan", "1 tsp cumin", "¼ tsp turmeric", "½ tomato, chopped", "½ carrot, chopped",
          "½ onion, finely chopped", "½ capsicum, chopped", "¼ cup curd", "½ tsp salt", "½ tsp chilli flakes", "½ cup water", "½ tsp Eno fruit salt",
          "Oil, for roasting",
        ],
      },
      {
        name: "Oats & Sprouts Roti (Paratha)", channel: "FoodFitness&Fun", video: "https://www.youtube.com/watch?v=VtbwPNH-lYI", meals: {"breakfast": "main"}, macros: {"servings": 4, "serving": "1 roti (about 40 g of flour)", "basis": "assumed", "why": "Assumed: about 40 g of flour per roti.", "kcal": 220.3, "p": 9.7, "c": 40.3, "f": 3.2}, from: DESC,
        ingredients: [
          "1 cup quick oats flour", "¾ cup wheat flour", "1 cup sprouts", "Some fresh spinach leaves", "1 tbsp flax seeds",
          "1 tsp roasted cumin seeds powder", "Salt, to taste", "½ tsp chilli flakes (optional)", "1 tsp coriander powder", "½ tsp ajwain", "1 pinch turmeric (haldi)",
        ],
      },
      {
        name: "Oats Dhokla", channel: "Preeti's Corner", video: "https://www.youtube.com/watch?v=b2zRFbDAVuc", meals: {"breakfast": "main"}, macros: {"servings": 2, "serving": "about 50 g of the dry batter ingredients (roughly 2 dosas or 1 omelette)", "basis": "assumed", "why": "Assumed: about 50 g of dry flour and dal per serving.", "kcal": 281.4, "p": 12.1, "c": 32.9, "f": 11.4}, from: DESC,
        ingredients: [
          "½ cup oats (crushed into powder)", "½ cup gram flour (besan)", "1 cup curd", "2 tsp chopped coriander", "2 green chillies (split)",
          "⅓ tsp turmeric powder", "1 tsp grated ginger", "Curry leaves", "1 tsp mustard seeds", "1 tsp cooking oil", "1 tsp fruit salt (Eno)",
          "1 tsp mustard seeds", "1 tsp cooking oil", "½ cup water", "Salt, to taste",
        ],
        note: "The creator lists the mustard seeds and oil twice.",
      },
      {
        name: "Overnight Oats (2 Ways)", channel: HK, video: "https://www.youtube.com/watch?v=cqdtrqTUolQ", meals: {"breakfast": "main"}, macros: {"servings": 2, "serving": "1 jar (one flavor; this is the average of the two)", "basis": "source", "why": "The page says it serves 2, one per flavor.", "kcal": 564.3, "p": 17.1, "c": 95.2, "f": 15.6}, makes: "Serves 2", from: PAGE,
        ingredients: [
          {
            title: "Carrot and cinnamon",
            items: [
              "¾ cup rolled oats", "1 tbsp chia seeds", "½ cup low-fat milk", "2 tbsp curd / Greek yogurt", "1 tbsp honey",
              "¼ tsp cinnamon powder", "½ cup carrot, grated", "1 tbsp raisins", "1 tbsp walnuts, chopped",
            ],
          },
          {
            title: "Chocolate and banana",
            items: [
              "¾ cup rolled oats", "1 tbsp chia seeds", "½ cup low-fat milk", "2 tbsp curd / Greek yogurt", "1 tbsp honey", "1 tbsp choco chips",
              "½ tsp almonds, chopped", "1 tsp vanilla extract", "1 banana, chopped", "½ tsp pistachios, chopped",
            ],
          },
        ],
      },
      {
        name: "High-Protein Oats Smoothie (No Sugar)", channel: "Skinny Recipes", video: "https://www.youtube.com/watch?v=OrfmAAgKJmE", meals: {"breakfast": "side"}, macros: {"servings": 1, "serving": "1 glass (the whole recipe)", "basis": "assumed", "why": "A single-glass recipe.", "kcal": 516.6, "p": 15.1, "c": 67.5, "f": 25.1}, from: DESC,
        ingredients: [
          "3 tbsp rolled oats", "1 glass water", "¼ cup roasted peanuts", "1 medjool date", "1 cinnamon stick or ½ tsp cinnamon powder",
          "1 tbsp flax seeds", "1 tsp chia seeds", "1 ripe banana", "Roasted peanuts and cinnamon powder, to garnish",
        ],
      },
      {
        name: "Oats Kheer", channel: "Yum", video: "https://www.youtube.com/watch?v=IDIkY5k6kFM", macros: {"servings": 2, "serving": "1 bowl (about 250 g)", "basis": "assumed", "why": "Assumed: a bowl is about 250 g of the finished dish.", "kcal": 267.4, "p": 10.2, "c": 35.6, "f": 9.8}, from: DESC,
        ingredients: ["60 g oats", "330 ml milk", "1 tbsp almonds", "1 tbsp sugar"],
      },
      {
        name: "Oats Laddu (No Sugar)", channel: HK, video: "https://www.youtube.com/watch?v=suXEDJp4sBY", macros: {"servings": 13, "serving": "1 laddu", "basis": "source", "why": "The page says it makes 13 laddus.", "kcal": 233.4, "p": 5.7, "c": 28.3, "f": 12.3}, makes: "Makes 13 laddus", from: PAGE,
        ingredients: [
          "1 cup rolled oats", "¾ cup almonds", "½ cup cashews", "½ cup peanuts", "2 tbsp sesame seeds", "2 tbsp sunflower seeds", "2 tbsp poppy seeds",
          "½ cup coconut (shredded)", "1 tsp ghee", "5 anjeer (figs), chopped", "2 tbsp raisins", "½ tsp cardamom powder", "5 dates (khajoor), seedless", "1 cup jaggery",
        ],
      },
    ],
  },

  // ============================ QUINOA ============================
  {
    id: "quinoa",
    title: "Quinoa",
    note: "Everyday Indian dishes made with quinoa. The quinoa idli is in the Idlis section.",
    recipes: [
      {
        name: "Quinoa Upma", channel: "Times Foodie", video: "https://www.youtube.com/watch?v=PiEQb61pvps", meals: {"breakfast": "main"}, macros: {"servings": 2, "serving": "1 plate (about 50 g of dry grain)", "basis": "assumed", "why": "Assumed: about 50 g of dry grain per plate.", "kcal": 364.7, "p": 9.7, "c": 41.2, "f": 18.8}, from: DESC,
        ingredients: [
          "½ cup quinoa", "2 tbsp oil", "1 tsp mustard seeds", "1 tsp urad dal", "1 pinch asafoetida", "7–8 curry leaves", "1 tsp ginger, finely chopped",
          "2 green chillies, finely chopped", "1 onion, chopped", "1 carrot, finely chopped", "¼ cup French beans, chopped", "¼ cup green peas",
          "1 tbsp salted peanuts, roasted", "Juice of half a lemon", "Salt, to taste", "Water, as required",
        ],
      },
      {
        name: "Quinoa Pulao", channel: "Chef Harpal Singh", video: "https://www.youtube.com/watch?v=4JygjBTh47A", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 2, "serving": "1 plate (about 50 g of dry grain)", "basis": "assumed", "why": "Assumed: about 50 g of dry grain per plate.", "kcal": 301.8, "p": 9.5, "c": 46.7, "f": 9.6}, from: DESC,
        ingredients: [
          "1½ cups quinoa, boiled", "1 tbsp ghee", "1 inch cinnamon stick", "2 bay leaves", "1 tbsp ginger, chopped", "2–3 green chillies, chopped",
          "1 tsp cumin seeds", "1 onion, chopped", "1 carrot, cut into small cubes", "¼ cup green peas", "2–3 French beans, diamond cut",
          "¼ cup cauliflower florets", "2 tomatoes, cubed", "Salt, to taste", "1 tbsp coriander powder", "½ tsp red chilli powder",
          "1 tsp garam masala powder", "1 cup water", "½ lemon, juiced", "Fresh coriander sprigs, for garnishing",
        ],
      },
      {
        name: "Quinoa Vegetable Biryani", channel: "Sanjeev Kapoor Khazana", video: "https://www.youtube.com/watch?v=mDpsN3t4HW0", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 2, "serving": "1 plate (about 50 g of dry grain)", "basis": "assumed", "why": "Assumed: about 50 g of dry grain per plate.", "kcal": 486.9, "p": 16.5, "c": 83.8, "f": 11.2}, from: DESC,
        ingredients: [
          "¾ cup quinoa, cooked till ¾ done", "¾ cup brown rice, cooked till ¾ done", "2½ tbsp biryani masala powder", "2½ tsp ghee",
          "1½ tsp cumin seeds", "1 large onion, chopped", "1 tbsp ginger-garlic paste", "2 medium tomatoes, chopped", "Salt, to taste",
          "1 tsp red chilli powder", "½ tsp turmeric powder", "2 tsp cumin powder", "½ tsp coriander powder", "½ tsp green cardamom powder",
          "10–12 small cauliflower florets", "1 small carrot, cut into diamonds", "4–6 French beans, cut into 1 inch pieces",
          "1 medium potato, cut into cubes", "½ cup frozen green peas", "2 tbsp freshly chopped fenugreek leaves (methi)", "4 tbsp fried onion",
          "¾ cup yogurt", "A pinch of saffron, soaked in 2 tbsp warm milk", "2 tbsp freshly chopped coriander leaves, plus more for garnish",
          "2 tbsp mint leaves", "2–3 green chillies, slit", "1 inch ginger, cut into thin strips", "1 tbsp rose water", "1 tbsp kewra water", "Raita, to serve",
        ],
      },
      {
        name: "Quinoa Poha", channel: "Healthy Indian Recipes", video: "https://www.youtube.com/watch?v=CsHU1jSKtjQ", meals: {"breakfast": "main"}, macros: {"servings": 3, "serving": "1 plate (about 50 g of dry grain)", "basis": "assumed", "why": "Assumed: about 50 g of dry grain per plate.", "kcal": 301.9, "p": 9.7, "c": 38.6, "f": 12.5}, from: DESC,
        ingredients: [
          "1 cup quinoa", "1 tsp oil (for cooking the quinoa)", "1 tbsp oil (for the poha)", "1 tsp cumin seeds", "2 tbsp raw peanuts",
          "1–2 green chillies (to taste)", "1 tsp turmeric powder", "¼ cup onions", "½ tsp salt",
        ],
      },
      {
        name: "Curd Quinoa", channel: "Cooking With Priti Puja", video: "https://www.youtube.com/watch?v=Gq4nEPkTsVU", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 2, "serving": "1 plate (about 50 g of dry grain)", "basis": "assumed", "why": "Assumed: about 50 g of dry grain per plate.", "kcal": 377.8, "p": 15.9, "c": 38.5, "f": 18.9}, from: DESC,
        ingredients: [
          "½ cup (100 g) quinoa", "1 cup curd", "8–10 curry leaves", "1 tsp urad dal", "1 tsp Bengal gram (chana dal)", "1–2 dry red chillies",
          "1 tsp mustard seeds", "1 tsp cumin seeds", "1–2 tsp desi ghee", "1 pinch hing (asafoetida)", "Salt, to taste", "¼ cup peanuts",
          "2–3 tsp finely chopped coriander leaves",
        ],
        note: "The description lists the ghee as 1 tsp in Hindi and 2 tsp in English.",
      },
      {
        name: "Quinoa Rajma Salad", channel: "YourHealthyHomeFood", video: "https://www.youtube.com/watch?v=enmQkPBIHtA", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 2, "serving": "1 bowl (about 40 g of dry quinoa, with its share of the beans and corn)", "basis": "assumed", "why": "Assumed: the recipe makes about 2 bowls.", "kcal": 294.8, "p": 8.3, "c": 34.1, "f": 15.3}, from: DESC,
        ingredients: [
          "½ bowl uncooked white quinoa", "½ bowl boiled kidney beans (rajma)", "½ bowl frozen corn kernels", "½ tsp lemon zest",
          "2 tbsp extra virgin olive oil", "2 tbsp diced yellow bell pepper", "3 tbsp diced red bell pepper", "3 tbsp chopped coriander leaves",
          "3–4 lettuce leaves", "1 onion, chopped", "1 tsp roasted and pounded cumin seeds", "1 tbsp salt", "2 tbsp lemon juice", "1 tsp black pepper powder",
        ],
      },
      {
        name: "Quinoa Dosa (No Fermentation)", channel: "Thasneen", video: "https://www.youtube.com/watch?v=kmpr4QZRl0Y", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 12, "serving": "about 50 g of the dry batter ingredients (roughly 2 dosas or 1 omelette)", "basis": "assumed", "why": "Assumed: about 50 g of dry flour and dal per serving.", "kcal": 183.4, "p": 10.1, "c": 32.1, "f": 1.9}, from: DESC,
        ingredients: ["1 cup quinoa", "½ cup oats", "½ cup moong dal", "½ cup red lentil", "½ cup urad dal (black gram)", "½ cup chana dal"],
        note: "The description lists only the grains and dals. Watch the video for the seasonings and other amounts.",
      },
      {
        name: "Quinoa Patties", channel: "FoodTokWithSherin", video: "https://www.youtube.com/watch?v=trjtt2I9lOk", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 4, "serving": "2 patties", "basis": "assumed", "why": "Assumed: the recipe makes about 8 patties.", "kcal": 161.2, "p": 6.1, "c": 24.5, "f": 4.5}, from: DESC,
        ingredients: [
          "½ cup quinoa", "1 cup water", "Salt, as per taste", "1 small onion, finely chopped", "4–5 cloves garlic, finely chopped", "1 green chilli, finely chopped",
          "1 small piece carrot, grated", "A few coriander leaves, finely chopped", "2 cubes processed cheese, grated", "1 tbsp hot sauce",
          "1 tsp honey", "1½ tsp lemon juice", "¼ cup bread crumbs", "Oil, butter or ghee, for pan frying",
        ],
      },
      {
        name: "Quinoa Pongal", channel: "ManaMuchatlu", video: "https://www.youtube.com/watch?v=vkQ0d5VGegA", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 4, "serving": "1 bowl (about 100 g of dry rice or grain and dal)", "basis": "assumed", "why": "Assumed: about 100 g of dry grain and dal per bowl.", "kcal": 339.1, "p": 17.7, "c": 62.1, "f": 2.6}, from: DESC,
        ingredients: [
          "¼ cup rice", "¾ cup quinoa", "1 cup fried moong dal", "Ghee (amount not given)", "1 spoon jeera (cumin)", "Chopped green chilli", "Chopped cashews", "Chopped curry leaves",
        ],
        note: "For 2 cups of the rice, quinoa and dal mix, add 6 cups of water and pressure cook for 2 whistles.",
      },
      {
        name: "Quinoa Kheer", channel: "Syreen's Kitchen", video: "https://www.youtube.com/watch?v=Hy62TG446Lw", macros: {"servings": 5, "serving": "1 bowl (about 250 g)", "basis": "assumed", "why": "Assumed: a bowl is about 250 g of the finished dish.", "kcal": 224.6, "p": 8.3, "c": 32.1, "f": 7.4}, from: DESC,
        ingredients: ["⅓ cup quinoa", "1 litre milk", "5 cardamom", "2 sticks cinnamon", "3 tbsp raisins", "4 tbsp sugar", "A pinch of salt"],
      },
    ],
  },

  // ============================ MILLETS ============================
  {
    id: "millets",
    title: "Millet recipes",
    note: "Recipes where millet is the only grain. The ragi idli, foxtail millet idli and jowar poha are in their own sections.",
    recipes: [
      {
        name: "Ragi Mudde (Finger Millet Balls)", channel: HK, video: "https://www.youtube.com/watch?v=B_e7MBBbZAQ", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 3, "serving": "1 of the page's 3 servings", "basis": "source", "why": "The page says it serves 3.", "kcal": 157.8, "p": 4.3, "c": 29.8, "f": 2.4}, makes: "Serves 3", from: PAGE,
        ingredients: ["1 cup ragi flour (finger millet flour)", "2 cups water", "¼ tsp salt", "½ tsp ghee"],
      },
      {
        name: "Ragi Chilla", channel: HK, video: "https://www.youtube.com/watch?v=fZvn_fb8QbY", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 10, "serving": "1 of the page's 10 servings", "basis": "source", "why": "The page says it serves 10.", "kcal": 77.7, "p": 3.3, "c": 12.6, "f": 1.6}, makes: "Serves 10", from: PAGE,
        ingredients: [
          "¾ cup ragi flour (finger millet flour)", "¾ cup besan (gram flour)", "¾ cup curd", "1 cup water", "1 tsp salt", "1 tsp ginger paste",
          "2 chillies, finely chopped", "A few curry leaves, chopped", "½ onion, finely chopped", "2 tbsp spring onion, chopped", "½ carrot, grated",
          "1 tsp cumin", "1 tsp sesame", "1 pinch hing", "Ghee, for roasting",
        ],
      },
      {
        name: "Ragi Soup", channel: HK, video: "https://www.youtube.com/watch?v=tA13G2D6oV4", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 4, "serving": "1 bowl (1 of the page's 4 servings)", "basis": "source", "why": "The page says it serves 4.", "kcal": 104.3, "p": 2.8, "c": 17.1, "f": 3.1}, makes: "Serves 4", from: PAGE,
        ingredients: [
          "½ cup ragi flour", "5 cups water", "2 tsp oil", "1 inch cinnamon", "5 cloves garlic, sliced", "2 chillies, finely chopped",
          "½ onion, finely chopped", "½ carrot, finely chopped", "5 beans, finely chopped", "3 tbsp peas", "2 tbsp sweet corn",
          "2 tbsp cabbage, shredded", "1 tsp salt", "½ tsp pepper powder", "2 tbsp lemon juice", "2 tbsp spring onion, chopped",
        ],
      },
      {
        name: "Ragi Porridge", channel: "Gita's Kitchen", video: "https://www.youtube.com/watch?v=d9QWiwnIhrA", meals: {"breakfast": "side"}, macros: {"servings": 2, "serving": "1 bowl (about 250 g)", "basis": "assumed", "why": "Assumed: a bowl is about 250 g of the finished dish.", "kcal": 166.1, "p": 8.7, "c": 21.0, "f": 5.6}, from: DESC,
        ingredients: ["2 tbsp ragi flour", "1 cup milk", "1 cup buttermilk", "2–3 cups water", "2 tsp jaggery powder", "Salt, to taste"],
      },
      {
        name: "Bajra Roti", channel: HK, video: "https://www.youtube.com/watch?v=tXVUqtKOjL4", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 6, "serving": "1 roti", "basis": "source", "why": "The page says it makes 6 rotis.", "kcal": 151.5, "p": 4.3, "c": 29.8, "f": 1.7}, makes: "Makes 6 rotis", from: PAGE,
        ingredients: ["2 cups bajra atta (pearl millet flour)", "½ tsp salt", "Hot water, to knead", "Wheat flour, for dusting"],
      },
      {
        name: "Jowar Roti", channel: "Bhusanur.cooking", video: "https://www.youtube.com/watch?v=oss7kyIlNgg", meals: {"lunch": "side", "dinner": "side"}, macros: {"servings": 1, "serving": "1 roti", "basis": "assumed", "why": "Assumed: ½ cup of jowar flour makes 1 roti.", "kcal": 225.7, "p": 5.4, "c": 48.2, "f": 2.1}, from: DESC,
        ingredients: ["½ cup jowar (sorghum millet) flour", "½ cup + 2 tbsp water", "Salt, to taste", "1 tsp wheat flour"],
        note: "The creator says the wheat flour can be swapped for jowar, rice or oats flour.",
      },
      {
        name: "Instant Jowar, Ragi & Bajra Dosa", channel: "Cuisine Crush", video: "https://www.youtube.com/watch?v=OkreSUc3sj8", meals: {"breakfast": "main", "dinner": "main"}, macros: {"servings": 8, "serving": "about 50 g of the dry batter ingredients (roughly 2 dosas or 1 omelette)", "basis": "assumed", "why": "Assumed: about 50 g of dry flour and dal per serving.", "kcal": 183.0, "p": 4.8, "c": 37.3, "f": 1.8}, from: DESC,
        ingredients: [
          {
            title: "Jowar dosa",
            items: [
              "1 cup jowar flour", "2 cups water", "Salt, as per taste", "½ tsp cumin seeds", "¼ cup chopped onion", "1 tbsp chopped coriander",
              "Chopped green chilli (optional)", "Ghee or oil",
            ],
          },
          {
            title: "Ragi dosa",
            items: [
              "1 cup ragi flour", "2 tbsp rice flour", "2 cups water", "¼ cup chopped onion", "1 tbsp chopped coriander", "Chopped green chilli (optional)",
              "Salt, as per taste", "½ tsp cumin seeds", "Ghee or oil",
            ],
          },
          {
            title: "Bajra dosa",
            items: [
              "1 cup bajra (pearl millet) flour", "2 cups water", "¼ cup chopped onion", "1 tbsp chopped coriander", "Chopped green chilli (optional)",
              "Chopped curry leaves", "1 pinch hing", "Salt, as per taste", "½ tsp cumin seeds", "Ghee or oil",
            ],
          },
        ],
        note: "The ragi dosa adds 2 tbsp of rice flour.",
      },
      {
        name: "Foxtail Millet Upma", channel: "HomeCookingShow", video: "https://www.youtube.com/watch?v=gVGlOTCNOZU", meals: {"breakfast": "main"}, macros: {"servings": 2, "serving": "1 plate (about 50 g of dry grain)", "basis": "assumed", "why": "Assumed: about 50 g of dry grain per plate.", "kcal": 316.4, "p": 9.8, "c": 54.6, "f": 6.9}, from: DESC,
        ingredients: [
          "½ cup foxtail millet (thinai / kangni)", "2 tsp ghee", "1 tsp chana dal", "1 tsp urad dal", "½ tsp mustard seeds", "½ tsp cumin seeds",
          "1 onion, chopped", "2 green chillies, chopped", "Chopped ginger (amount not given)", "A few curry leaves", "1 carrot, chopped",
          "A few chopped green beans", "½ cup green peas", "1 tomato, chopped", "Salt, to taste", "¼ tsp turmeric powder", "1½ cups water",
        ],
      },
      {
        name: "Foxtail Millet Pulao", channel: "Yum", video: "https://www.youtube.com/watch?v=Bf3tLIxSz0s", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 2, "serving": "1 plate (about 50 g of dry grain)", "basis": "assumed", "why": "Assumed: about 50 g of dry grain per plate.", "kcal": 461.1, "p": 9.2, "c": 58.2, "f": 22.0}, from: DESC,
        ingredients: [
          "100 g foxtail millet", "400 ml water", "400 ml warm water", "1 tsp ginger", "1 tsp garlic", "1 tsp green chilli", "1 tbsp oil",
          "100 g potatoes", "50 g green beans", "50 g carrots", "50 g green peas", "1 tsp salt", "2 tbsp desi ghee", "1 bay leaf",
          "2 pods green cardamom", "3 cloves", "1 cinnamon stick", "1 star anise", "1 mace", "½ tsp caraway seeds", "1 tbsp mint leaves",
          "100 g onions", "¾ tsp salt", "350 ml water", "Coriander, for garnishing",
        ],
        note: "The description lists water and salt more than once, likely for different steps. Watch the video to see which goes where.",
      },
      {
        name: "Sama Rice (Barnyard Millet) Pulao", channel: HK, video: "https://www.youtube.com/watch?v=zRRMhURQ3P0", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 2, "serving": "1 plate (1 of the page's 2 servings)", "basis": "source", "why": "The page says it serves 2.", "kcal": 686.6, "p": 18.3, "c": 95.0, "f": 27.1}, makes: "Serves 2", from: PAGE,
        ingredients: [
          "1 cup sama rice / barnyard millet", "Water, for soaking", "1 tbsp ghee", "1 tsp cumin (jeera)", "3 pods cardamom", "½ tsp pepper",
          "1 inch ginger, finely chopped", "2 chillies, slit", "½ potato, cubed", "½ carrot, cubed", "2 cups water", "½ tsp sendha namak (rock salt)",
          "½ tsp pepper powder", "½ tbsp ghee", "2 tbsp peanuts", "5 almonds (halves)", "10 cashews (halves)", "2 tbsp dry coconut, sliced",
          "½ cup makhana (fox nuts)", "1 tbsp lemon juice", "2 tbsp coriander, finely chopped",
        ],
      },
      {
        name: "Bajra Khichdi", channel: "Sanjeev Kapoor Khazana", video: "https://www.youtube.com/watch?v=A0Pym2NDtXE", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 4, "serving": "1 bowl (about 100 g of dry rice or grain and dal)", "basis": "assumed", "why": "Assumed: about 100 g of dry grain and dal per bowl.", "kcal": 513.5, "p": 17.1, "c": 89.7, "f": 10.0}, from: DESC,
        ingredients: [
          "1½ cups bajra (millet), soaked overnight", "½ cup split skinless green gram (moong dal), soaked", "2 tbsp ghee", "1½ tsp cumin seeds",
          "2–3 green chillies, chopped", "7–8 curry leaves", "¼ tsp asafoetida", "1 large onion, chopped", "1 large potato, cut into small cubes",
          "1 small carrot, peeled and cut into small cubes", "4–5 French beans, chopped", "1 tsp turmeric powder", "2 tsp red chilli powder",
          "Salt, to taste", "¼ cup green peas", "2 tbsp freshly chopped coriander leaves",
        ],
      },
      {
        name: "Foxtail Millet Sweet Pongal", channel: "Sanjeev Kapoor Khazana", video: "https://www.youtube.com/watch?v=gmCacZMqUhg", macros: {"servings": 4, "serving": "1 bowl (about 250 g)", "basis": "assumed", "why": "Assumed: a bowl is about 250 g of the finished dish.", "kcal": 404.0, "p": 11.3, "c": 60.6, "f": 13.7}, from: DESC,
        ingredients: [
          "½ cup foxtail millet, soaked 25–30 minutes and drained", "2½ cups milk", "¼ cup split skinless green gram (moong dal), soaked 25–30 minutes and drained",
          "½ cup chopped jaggery", "½ tsp green cardamom powder", "2 tbsp ghee", "6–8 cashew nuts, halved", "2 tbsp raisins",
        ],
      },
    ],
  },

  // ============================ PARATHAS ============================
  {
    id: "parathas",
    title: "Protein parathas",
    note: "The protein comes from the filling: paneer, dal, sattu, moong, rajma or tempeh. The oats and sprouts roti is in the Oats section.",
    recipes: [
      {
        name: "Paneer Paratha", channel: HK, video: "https://www.youtube.com/watch?v=mS8uOQh-ue8", meals: {"breakfast": "main", "lunch": "main", "dinner": "main"}, macros: {"servings": 6, "serving": "1 paratha (1 of the page's 6 servings)", "basis": "source", "why": "The page says it serves 6.", "kcal": 265.2, "p": 14.8, "c": 29.9, "f": 11.5}, makes: "Serves 6", from: PAGE,
        ingredients: [
          {
            title: "Filling",
            items: [
              "2 cups paneer, grated", "½ tsp cumin powder", "1 tsp aamchur", "½ tsp chilli powder", "1 inch ginger, grated",
              "2 chillies, finely chopped", "2 tbsp coriander, finely chopped", "½ tsp salt",
            ],
          },
          { title: "Dough", items: ["2 cups wheat flour", "½ tsp salt", "½ tsp ajwain (carom seeds)", "Water, for kneading"] },
        ],
      },
      {
        name: "Paneer & Vegetable Protein Paratha", channel: "Kabita's Kitchen", video: "https://www.youtube.com/watch?v=jPwJVpzw4DM", meals: {"breakfast": "main", "lunch": "main", "dinner": "main"}, macros: {"servings": 6, "serving": "1 paratha (about 40 g of flour)", "basis": "assumed", "why": "Assumed: about 40 g of flour per paratha, as in Hebbar's recipes.", "kcal": 249.7, "p": 13.5, "c": 31.0, "f": 9.8}, from: DESC,
        ingredients: [
          "200 g paneer", "2 cups wheat flour", "Water, as required", "2–3 tbsp coriander leaves", "2 tbsp onion", "2 tbsp red capsicum",
          "2 tbsp green capsicum", "2 tbsp yellow capsicum", "2 tbsp carrot", "2 tbsp frozen green peas", "1 tbsp green chilli", "Salt, to taste",
          "1 tsp mixed herbs", "1 tsp chilli flakes", "Oil, for frying",
        ],
      },
      {
        name: "Dal Paratha (Chana Dal)", channel: HK, video: "https://www.youtube.com/watch?v=tlLeNWFzvBs", meals: {"breakfast": "main", "lunch": "main", "dinner": "main"}, macros: {"servings": 10, "serving": "1 paratha", "basis": "source", "why": "The page uses 10 ball-sized portions of dough. Each is counted as 40 g of flour.", "kcal": 211.7, "p": 9.4, "c": 41.4, "f": 2.2}, from: PAGE,
        ingredients: [
          "1 cup chana dal, soaked 3 hours", "¼ tsp turmeric (haldi)", "½ tsp Kashmiri red chilli powder", "½ tsp aamchur (dry mango powder)",
          "½ tsp garam masala", "½ tsp cumin powder", "¼ tsp ajwain (carom seeds)", "½ tsp salt", "2 tbsp coriander leaves, finely chopped",
          "10 ball-sized portions of wheat dough", "Oil, for roasting",
        ],
        note: "Hebbar's says the same filling works with toor dal or moong dal.",
      },
      {
        name: "Moong Dal Paratha", channel: "Ajay Chopra", video: "https://www.youtube.com/watch?v=VZPXvnX9I4U", macros: {"na": "The dough amount isn't listed, so the paratha can't be counted."}, from: DESC,
        ingredients: [
          "1 cup soaked and boiled moong dal", "1 tbsp ghee", "1 tsp cumin seeds", "1 tsp hing (asafoetida)", "2 tsp chopped ginger",
          "2 tsp chopped green chilli", "1 tsp coriander powder", "1 tsp cumin powder", "½ tsp turmeric powder", "1 tsp red chilli powder",
          "½ tsp garam masala powder", "2 tbsp chopped coriander leaves", "Salt, to taste", "1 tbsp dried mango powder", "Atta dough (amount not given)",
        ],
        note: "Serve with curd, green chutney and green chillies.",
      },
      {
        name: "Methi Moong Paratha", channel: "Rajesh das", video: "https://www.youtube.com/watch?v=5XF_jFwqZ-Q", meals: {"breakfast": "main", "lunch": "main", "dinner": "main"}, macros: {"servings": 9, "serving": "1 paratha (about 40 g of flour)", "basis": "assumed", "why": "Assumed: about 40 g of flour per paratha, as in Hebbar's recipes.", "kcal": 212.8, "p": 9.2, "c": 40.2, "f": 3.2}, from: DESC,
        ingredients: [
          { title: "Moong", items: ["100 g whole moong (soaked overnight)", "Salt", "Turmeric"] },
          {
            title: "Paratha dough",
            items: [
              "350 g atta (whole wheat flour)", "The cooked moong", "100 g chopped methi (fenugreek) leaves", "1 large onion, chopped",
              "1 medium tomato, chopped", "4 green chillies (adjust to taste)", "4 tbsp sesame seeds", "1 tbsp chilli powder", "½ tbsp turmeric",
              "1 tbsp roasted cumin powder", "A pinch of hing (asafoetida)", "1 tbsp sugar", "Salt, to taste", "1–2 tbsp ginger-garlic", "1 tsp ajwain",
              "Fresh coriander", "Water (add gradually as needed)",
            ],
          },
          { title: "For cooking", items: ["Sesame seeds", "Chilli flakes", "Fresh coriander", "Ghee or oil"] },
          { title: "To serve with", items: ["Curd", "Pickle (achar)", "Onion", "Spicy aloo bhaji"] },
        ],
      },
      {
        name: "Sattu Paratha (Bihari Style)", channel: "Amrita Raichand", video: "https://www.youtube.com/watch?v=OHgQzWHKl_U", macros: {"na": "The dough amount isn't listed, so the paratha can't be counted."}, from: DESC,
        ingredients: [
          {
            title: "Filling",
            items: [
              "1 cup roasted chana flour (sattu)", "½ tsp carom seeds (ajwain)", "½ tsp kasuri methi, crushed", "1 tsp ginger, finely chopped",
              "3 tbsp onion, finely chopped", "4 green chillies, finely chopped", "2 tbsp fresh coriander leaves, finely chopped",
              "2 tsp homemade pickle masala", "½ tsp chaat masala", "Salt, to taste", "½ tsp turmeric powder", "Water, to make a soft dough",
            ],
          },
          { title: "Paratha dough", items: ["Whole wheat flour, water and a little salt, for a soft dough (as for regular rotis)"] },
          { title: "To serve with", items: ["Curd", "Roasted tomato chutney", "Pickle of your choice"] },
        ],
        note: "The creator stresses that the filling dough must be soft, with just enough water.",
      },
      {
        name: "Rajma Paratha", channel: "HomeCookingShow", video: "https://www.youtube.com/watch?v=GpObeMkbiRE", macros: {"na": "The dough amount isn't listed, so the paratha can't be counted."}, from: DESC,
        ingredients: [
          "1 bowl rajma beans", "Water", "Mustard oil (or oil of your choice)", "1 onion", "1 tsp ginger, finely chopped", "1 tsp garlic, finely chopped",
          "1 tsp green chilli, finely chopped", "½ tsp turmeric powder", "1 tsp chilli powder", "1 tsp coriander powder", "1 tsp cumin powder",
          "½ tsp garam masala", "Salt", "Pepper", "Mint leaves", "Coriander leaves", "Ghee", "Chapati dough",
        ],
        note: "The creator doesn't give amounts for several items. Watch the video for those.",
      },
      {
        name: "Palak Paneer Paratha", channel: "INDIANCOOKINEVERYDAY", video: "https://www.youtube.com/watch?v=USniwLerbrw", meals: {"breakfast": "main", "lunch": "main", "dinner": "main"}, macros: {"servings": 6, "serving": "1 paratha (about 40 g of flour)", "basis": "assumed", "why": "Assumed: about 40 g of flour per paratha, as in Hebbar's recipes.", "kcal": 275.2, "p": 15.3, "c": 30.4, "f": 12.3}, from: DESC,
        ingredients: [
          {
            title: "Dough",
            items: [
              "2 cups whole wheat flour", "2 cups chopped palak (spinach)", "1 tsp ginger-chilli paste", "1 tsp roasted cumin powder",
              "¾ tsp Kashmiri red chilli powder", "¾ tsp turmeric powder", "1 tsp salt", "1 tsp oil",
            ],
          },
          {
            title: "Stuffing",
            items: [
              "2 cups crumbled paneer", "¾ tsp cumin powder", "½ tsp garam masala powder", "½ tsp salt", "¾ tsp chaat masala",
              "Chopped coriander leaves", "Oil or ghee, for frying the parathas",
            ],
          },
        ],
      },
      {
        name: "Besan Stuffed Paratha", channel: "Cookd", video: "https://www.youtube.com/watch?v=h_90MVyvrlM", meals: {"breakfast": "main", "lunch": "main", "dinner": "main"}, macros: {"servings": 8, "serving": "1 paratha (about 40 g of flour)", "basis": "assumed", "why": "Assumed: about 40 g of flour per paratha, as in Hebbar's recipes.", "kcal": 151.3, "p": 5.9, "c": 27.0, "f": 2.9}, from: DESC,
        ingredients: [
          { title: "Dough", items: ["2 cups wheat flour (atta)", "¾ cup water", "½ tsp salt"] },
          {
            title: "Besan stuffing",
            items: [
              "¾ cup besan (gram flour)", "½ tsp turmeric powder", "1 tsp coriander powder", "½ tsp red chilli powder", "2 tbsp onion, finely chopped",
              "1 tsp coriander seeds, crushed", "1 tsp fennel seeds", "1 tsp cumin seeds", "1 green chilli, chopped", "1 tbsp ginger, chopped",
              "½ tsp salt", "1 tbsp ghee", "1 tsp dry mango powder", "2 tbsp coriander leaves, chopped", "Ghee, as needed (for cooking)",
            ],
          },
        ],
      },
      {
        name: "Pyaz Besan Paratha (Rajasthani Onion Paratha)", channel: "Chef Bhupi's Kitchen", video: "https://www.youtube.com/watch?v=cRWeCjQCb9Q", meals: {"breakfast": "main", "lunch": "main", "dinner": "main"}, macros: {"servings": 6, "serving": "1 paratha (about 40 g of flour)", "basis": "assumed", "why": "Assumed: about 40 g of flour per paratha, as in Hebbar's recipes.", "kcal": 174.6, "p": 6.6, "c": 37.1, "f": 1.2}, from: DESC,
        ingredients: [
          "2 cups wheat flour", "3–4 medium onions", "1 tsp black pepper", "1 tsp coriander seeds", "1 tsp cumin", "6–7 garlic cloves", "1 tsp asafoetida",
          "2–3 small green chillies", "2 tbsp gram flour (besan)", "½ tsp turmeric powder", "2 tsp chilli powder", "2 tsp coriander powder", "Salt, to taste",
          "½ tsp garam masala", "2 tsp dry mango powder", "2 tbsp green coriander", "1 tbsp kasoori methi", "Ghee, as required",
        ],
      },
      {
        name: "Chole (Chickpea) Paratha", channel: "Mom's Kitchen Aroma", video: "https://www.youtube.com/watch?v=hF6ZgkBPyxQ", meals: {"breakfast": "main", "lunch": "main", "dinner": "main"}, macros: {"servings": 9, "serving": "1 paratha (about 40 g of flour)", "basis": "assumed", "why": "Assumed: about 40 g of flour per paratha, as in Hebbar's recipes.", "kcal": 222.9, "p": 7.5, "c": 36.8, "f": 6.4}, from: DESC,
        ingredients: [
          {
            title: "Stuffing",
            items: [
              "200 g chickpeas (chole)", "1 medium onion, chopped", "½ inch ginger, chopped", "4–5 garlic, chopped", "1 green chilli, chopped",
              "3–4 coriander stems, chopped", "½ tsp cumin (zeera) seeds", "½ tsp fennel (saunf) seeds", "½ tsp turmeric", "1 tsp cumin (zeera) powder",
              "¼ tsp dry mango powder", "Salt, as per taste", "½ tsp sugar", "¼ lemon", "¼ tsp hing (asafoetida)", "1 tsp ghee", "2 tbsp refined oil",
            ],
          },
          { title: "Paratha", items: ["3 cups wheat flour", "Carom (ajwain) seeds (amount not given)", "2½ tsp refined oil", "Salt, as per taste", "Oil, for frying"] },
          {
            title: "Chutney",
            items: ["2 tbsp curd", "1 tbsp tomato sauce", "½ tsp roasted cumin seeds", "¼ tsp black salt", "Finely chopped coriander and green chilli (amounts not given)"],
          },
        ],
      },
    ],
  },

  // ============================ INSTANT POT LENTILS ============================
  {
    id: "instantpot",
    title: "Instant Pot lentils (dals)",
    note: "Indian lentil dishes that cook quickly in an Instant Pot. Rajma is a bean, not a lentil, but it is cooked the same way, so it's included.",
    recipes: [
      {
        name: "Restaurant-Style Dal Tadka (Mixed Dals)", channel: "Busy Bees Recipes", video: "https://www.youtube.com/watch?v=wKWm5qvaCDk", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "1 bowl (about 40 g of dry dal)", "basis": "assumed", "why": "Assumed: about 40 g of dry dal per bowl.", "kcal": 202.0, "p": 10.0, "c": 28.9, "f": 5.8}, from: DESC,
        ingredients: [
          "½ cup masoor dal", "¼ cup moong dal", "¼ cup toor dal", "1 onion, chopped small", "1 tomato, chopped small", "4 garlic cloves, chopped small",
          "Curry leaves (amount not given)", "2 green chillies, slit", "2 dried red chillies", "1 tsp cumin seeds", "1 tsp chilli powder", "¼ tsp turmeric powder",
          "1 tsp cumin powder", "1 pinch asafoetida", "1 tsp kasuri methi", "1 tbsp ghee", "1 tbsp oil", "Salt", "2 cups water",
        ],
        note: "The description says \"1 tap\" for the cumin seeds. I read that as 1 tsp.",
      },
      {
        name: "Moong Dal Tadka", channel: "Busy Bees Recipes", video: "https://www.youtube.com/watch?v=tr1yYbZcVuw", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "1 bowl (about 40 g of dry dal)", "basis": "assumed", "why": "Assumed: about 40 g of dry dal per bowl.", "kcal": 212.4, "p": 10.7, "c": 30.9, "f": 5.9}, from: DESC,
        ingredients: [
          {
            title: "Dal",
            items: [
              "1 cup moong dal (240 ml cup)", "3 cups water", "1 medium onion, finely chopped", "2 medium tomatoes, cut small", "3 green chillies, slit",
              "4 garlic cloves, minced", "1 inch ginger, minced",
            ],
          },
          {
            title: "Tadka (sauté step)",
            items: ["1 tbsp ghee", "1 tbsp oil", "1 tsp cumin seeds", "1 dried red chilli", "A pinch of hing (asafoetida)", "Curry leaves", "Salt"],
          },
        ],
      },
      {
        name: "Urad Dal Tadka (Dhaba Style)", channel: "Chili In a Pod", video: "https://www.youtube.com/watch?v=UPOEREBP7kk", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 3, "serving": "1 bowl (about 40 g of dry dal)", "basis": "assumed", "why": "Assumed: about 40 g of dry dal per bowl.", "kcal": 357.1, "p": 9.7, "c": 30.3, "f": 22.9}, from: DESC,
        ingredients: [
          {
            title: "Dal",
            items: [
              "100 g split white urad dal (soaked 15–20 minutes in hot water)", "3 tbsp oil", "2 tbsp ghee", "1 tsp cumin seeds", "2 cloves", "2 cardamom",
              "1 large onion, finely chopped", "1 tbsp ginger-garlic paste", "3 medium tomatoes, pureed", "2 tsp red chilli powder", "½ tsp turmeric powder",
              "1 tsp coriander powder", "½ tsp black pepper powder", "½ tsp chaat masala (optional)", "½ tsp garam masala powder", "Salt, as required", "Water (amount not given)",
            ],
          },
          {
            title: "Garnish",
            items: ["2 tbsp chopped cilantro", "3 medium green chillies", "1 tsp lemon juice", "2 tsp dried fenugreek leaves (kasuri methi)", "¼ tsp garam masala"],
          },
        ],
      },
      {
        name: "Chana Dal Tadka", channel: "Sushma's Healthy Kitchen", video: "https://www.youtube.com/watch?v=nXWiQkcZrX4", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "1 bowl (about 40 g of dry dal)", "basis": "assumed", "why": "Assumed: about 40 g of dry dal per bowl.", "kcal": 208.6, "p": 8.8, "c": 28.7, "f": 7.2}, from: DESC,
        ingredients: [
          "1 cup chana dal", "1½ tbsp oil", "1 tsp cumin seeds (jeera)", "1 pinch asafoetida (hing)", "1 small onion, sliced", "2 green chillies, chopped",
          "A few curry leaves", "1 tbsp ginger-garlic paste", "⅓ tsp turmeric", "1 tsp coriander (dhaniya) powder", "½ tsp cumin (jeera) powder",
          "1 tsp red chilli powder", "½ tsp chilli flakes", "1 cup tomatoes, chopped", "Salt, to taste", "½ tsp garam masala", "½ tsp kasoori methi (dried fenugreek leaves)",
          "1–2 green chillies, chopped", "A few ginger julienne", "2 tbsp cilantro (coriander leaves)", "½ to 1 tsp ghee",
        ],
      },
      {
        name: "Toor Dal (Plain Indian Dal)", channel: "The Shooting Nomads", video: "https://www.youtube.com/watch?v=REZRzsyFazw", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 13, "serving": "1 bowl (about 40 g of dry dal)", "basis": "assumed", "why": "Assumed: about 40 g of dry dal per bowl.", "kcal": 142.7, "p": 8.8, "c": 26.4, "f": 0.6}, from: DESC,
        ingredients: [
          "2½ cups washed toor dal", "1 tbsp salt, or to taste", "1 tbsp turmeric", "½ tsp chilli powder", "1 tbsp cumin powder (or roasted cumin seeds)", "1 tbsp garam masala",
          "5–7 garlic, finely chopped", "1 inch ginger, finely chopped", "1 small chopped chilli pepper", "A pinch of red pepper", "A few chopped curry leaves, if available",
          "1 chopped onion", "1 chopped tomato", "1 tbsp mustard seeds", "Chopped cilantro, for garnish",
        ],
        note: "A big batch. These are the creator's amounts, so adjust the spices to taste.",
      },
      {
        name: "Dal Palak (Spinach Dal)", channel: "Piping Pot Curry", video: "https://www.youtube.com/watch?v=y6dwKP7EcUs", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "1 bowl (about 40 g of dry dal)", "basis": "assumed", "why": "Assumed: about 40 g of dry dal per bowl.", "kcal": 179.5, "p": 10.9, "c": 28.6, "f": 3.2}, from: DESC,
        ingredients: [
          {
            title: "Dal",
            items: [
              "1 cup split pigeon pea (toor dal), washed (or a mix with masoor or moong dal)", "1 tbsp ghee or oil", "1 tsp cumin seeds (jeera)", "⅛ tsp asafoetida (hing), optional",
              "1 green chilli, diced (optional)", "1 tsp ginger, grated", "4 cloves garlic, minced", "¾ cup tomato, chopped", "3 cups water",
              "2 cups spinach (palak), chopped (about 6–8 oz)", "1–2 tsp lime juice", "½ tsp garam masala",
            ],
          },
          { title: "Spices", items: ["1 tsp salt", "½ tsp ground turmeric (haldi)", "½ tsp Kashmiri red chilli powder (optional)"] },
          { title: "Pot-in-pot basmati rice (optional)", items: ["1 cup basmati rice", "1¼ cups water", "1 tbsp ghee (optional)"] },
        ],
      },
      {
        name: "Methi Dal", channel: "MyWay YourKitchen", video: "https://www.youtube.com/watch?v=hLMp8iZXGjI", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 4.5, "serving": "1 bowl (about 1 cup)", "basis": "source", "why": "The creator says it serves 4 to 5.", "kcal": 181.0, "p": 10.9, "c": 31.8, "f": 1.8}, makes: "Serves 4–5", from: DESC,
        ingredients: [
          "1 cup toor dal", "4 cups water", "2 cups fenugreek (methi) leaves", "1 tsp oil", "1 tsp mustard seeds", "1 tsp cumin seeds", "Curry leaves",
          "Red chilli", "Hing", "Green chilli", "½ cup onion", "½ cup tomato", "Coriander leaves", "Salt, to taste",
        ],
        note: "The creator gives the cooking time as 10 minutes.",
      },
      {
        name: "Tomato Dal (Tomato Pappu)", channel: "Sandhya's Kitchen", video: "https://www.youtube.com/watch?v=9Y2wMlv4x5o", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 8, "serving": "1 bowl (about 40 g of dry dal)", "basis": "assumed", "why": "Assumed: about 40 g of dry dal per bowl.", "kcal": 171.9, "p": 8.8, "c": 26.3, "f": 4.0}, from: DESC,
        ingredients: [
          "1½ cups toor dal, soaked about 30 minutes", "2 medium tomatoes, diced", "½ medium onion, diced", "3 garlic cloves, crushed", "2 tbsp chilli powder",
          "1 tbsp turmeric powder", "½ tbsp cumin powder", "Salt, to taste", "4 green chillies, slit", "1 tsp mustard seeds", "1 tsp cumin seeds", "2 tbsp oil",
          "1 bunch coriander leaves", "5–6 curry leaves", "2 cups tamarind juice (a fistful of raw tamarind soaked in water, or 2 tbsp tamarind paste in a cup of water)",
        ],
      },
      {
        name: "Sambar (Instant Pot)", channel: "Nidhicooks", video: "https://www.youtube.com/watch?v=GIjvA3J2yII", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "1 bowl (about 40 g of dry dal)", "basis": "assumed", "why": "Assumed: about 40 g of dry dal per bowl.", "kcal": 173.3, "p": 8.9, "c": 27.9, "f": 3.3}, from: DESC,
        ingredients: [
          {
            title: "Sambar",
            items: [
              "1 cup toor dal", "Vegetables of your choice (she uses 1 tomato, 1 drumstick, some shallots, ½ radish, 1 carrot, ½ bottle gourd, 1 potato and curry leaves)",
              "½ tsp turmeric powder", "1 tbsp Kashmiri red chilli powder", "1 tbsp cumin-coriander powder", "1½ tbsp sambar powder", "Salt, to taste",
              "1 tbsp tamarind juice (2 tbsp for a tangier taste)", "1 tbsp jaggery",
            ],
          },
          {
            title: "Tempering",
            items: ["1 tbsp oil", "1 tsp mustard seeds", "½ tsp cumin seeds", "A few methi seeds", "A pinch of asafoetida", "½ tsp red chilli powder", "A few whole red chillies", "A few curry leaves"],
          },
        ],
      },
      {
        name: "Dal Makhani", channel: "TiffinLivin'", video: "https://www.youtube.com/watch?v=x6a2pm8M9RI", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 12, "serving": "1 bowl (about 40 g of dry dal)", "basis": "assumed", "why": "Assumed: about 40 g of dry dal per bowl.", "kcal": 358.3, "p": 12.4, "c": 35.9, "f": 19.6}, from: DESC,
        ingredients: [
          "2 cups black urad dal (whole black matpe beans)", "½ cup rajma (red kidney beans)", "4 tbsp ghee", "½ stick unsalted butter", "2 serrano peppers, chopped",
          "2 red onions, chopped", "4 tbsp ginger", "4 tbsp garlic", "2 tbsp Kashmiri red chilli powder", "2 tbsp jeera-dhaniya (cumin-coriander) powder",
          "1 tbsp jeera (cumin) seeds", "1 tsp haldi (turmeric)",
          "8 tbsp freshly ground spice mix (equal parts amchur, black pepper, cloves, nutmeg, mace, star anise and hing)", "1 tsp crushed kasoori methi",
          "4 cups tomato purée", "1½ cups heavy cream",
        ],
        note: "A large batch. Not vegan, because of the butter and cream.",
      },
      {
        name: "Mixed Dal Khichdi", channel: "Patel Brothers", video: "https://www.youtube.com/watch?v=AWNMddaKz0A", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 5, "serving": "1 bowl (about 100 g of dry rice or grain and dal)", "basis": "assumed", "why": "Assumed: about 100 g of dry grain and dal per bowl.", "kcal": 463.4, "p": 17.6, "c": 70.5, "f": 12.9}, from: DESC,
        ingredients: [
          {
            title: "Khichdi",
            items: [
              "1 cup rice", "¾ cup moong dal", "¾ cup masoor dal", "1 medium onion, sliced", "1 medium tomato, sliced", "1 tsp ginger-garlic paste", "1 tsp salt",
              "¼ tsp turmeric powder", "1½ tsp chilli powder", "1 tsp coriander powder", "1 tsp cumin powder", "½ tsp garam masala powder",
            ],
          },
          {
            title: "First tempering",
            items: ["1 tbsp ghee", "1½ tbsp oil", "½ tsp shah zeera (black cumin seeds)", "3 green cardamom pods", "1 black cardamom", "1 bay leaf", "4 cloves", "½ inch cinnamon stick"],
          },
          { title: "Second tempering", items: ["1 tbsp ghee", "1 tbsp oil", "2 dry red chillies", "1 tsp cumin seeds", "½ tsp Kashmiri red chilli powder"] },
          { title: "Garnish", items: ["Fried onion", "Chopped cilantro"] },
        ],
        note: "The ingredient list says ¾ cup of each dal, but the method uses ½ cup of each. Either works with 1 cup of rice.",
      },
      {
        name: "Brown Rice & Lentil Khichdi", channel: "Siri Cooks", video: "https://www.youtube.com/watch?v=gYTUQBkVSp0", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 4, "serving": "1 bowl (about 100 g of dry rice or grain and dal)", "basis": "assumed", "why": "Assumed: about 100 g of dry grain and dal per bowl.", "kcal": 528.8, "p": 20.2, "c": 95.2, "f": 8.9}, from: DESC,
        ingredients: [
          "1 cup brown rice", "1 cup mixed lentils (moong, masoor, toor and chana dal)", "5 cups water", "2 tbsp ghee", "1 tsp cumin seeds", "1 tbsp ginger paste",
          "4 green chillies", "2 carrots, peeled and sliced", "2 potatoes, cubed", "2 tomatoes, diced", "1 cup cauliflower, chopped", "1 cup cabbage, chopped",
          "1½ cups spinach, chopped", "½ tsp turmeric", "1 tsp red chilli powder", "Salt, to taste", "¼ cup cilantro, chopped, for garnish",
        ],
      },
      {
        name: "Rajma Masala (Kidney Beans)", channel: "My Ginger Garlic Kitchen", video: "https://www.youtube.com/watch?v=gv1ZjK8whfM", meals: {"lunch": "main", "dinner": "main"}, macros: {"servings": 7, "serving": "1 bowl (about 50 g of dry rajma)", "basis": "assumed", "why": "Assumed: about 50 g of dry beans per bowl.", "kcal": 232.7, "p": 13.2, "c": 36.8, "f": 4.4}, from: DESC,
        ingredients: [
          "2 cups rajma (kidney beans), which becomes 3 cups after soaking overnight", "1 bay leaf (tej patta)", "2–3 cloves", "Salt, to taste", "2 onions, chopped",
          "2 tomatoes, chopped", "1 tbsp ginger, chopped", "2 tbsp garlic, chopped", "2 tbsp oil", "3 green chillies, slit", "½ tsp cumin seeds",
          "2 tsp coriander powder (dhaniya)", "1 tsp cumin powder (jeera)", "¼ tsp roasted cumin powder (bhuna jeera)", "1 tsp red chilli powder (lal mirch)",
          "½ tsp garam masala powder", "½ tbsp powdered kasuri methi (optional)", "3 cups water, or more if required",
        ],
      },
    ],
  },
  // ============================ DRESSINGS ============================
  // Not used by the meal planner: these have no `meals` tag, and the section is marked inPlanner: false.
  {
    id: "dressings",
    title: "Dressings",
    inPlanner: false,
    note: "Healthy dressings to pour over any salad, bowl or roasted vegetables. Yogurt, tahini and herb dressings add protein and flavor; the vinaigrettes are mostly olive oil, so a spoonful goes a long way. These are not part of the meal planner, so they never show up in your random picks. Each card shows the nutrition for one 2-tablespoon serving, or the creator's own serving where the recipe gives one.",
    recipes: [
      {
        name: "Avocado Green Goddess Dressing", channel: "Mallory the Dietitian", video: "https://www.youtube.com/watch?v=npJKehVy1sY",
        macros: {"servings": 12, "serving": "2 tablespoons", "basis": "source", "why": "The recipe card says it makes 12 servings of 2 tablespoons.", "kcal": 39.6, "p": 2.4, "c": 2.1, "f": 2.6},
        makes: "Makes 12 servings", from: CPAGE,
        ingredients: [
          "1 small avocado (or half a medium avocado, 150 g)", "1 cup plain Greek yogurt", "1 cup fresh parsley, loosely packed", "½ cup fresh dill, loosely packed", "½ cup fresh mint, loosely packed", "1 cup baby spinach", "3–4 tbsp lemon juice (about 1 large lemon)", "1 tsp extra virgin olive oil", "1 garlic clove", "½ tsp salt (more to taste)", "Pinch of black pepper", "2–4 tbsp water, to thin it",
        ],
        note: "Not Panera's recipe. It is a dietitian's avocado version of green goddess, with Greek yogurt and avocado instead of mayo. The creator lists 30 kcal, 3 g protein, 2 g carbs and 2 g fat per serving; mine come out close. I counted 3½ tbsp of lemon juice and 3 tbsp of water. Herbs, lemon juice, salt and water count as zero. Keeps 4 to 5 days in the fridge.",
      },
      {
        name: "Lemon Tahini Dressing", channel: "LVL Holistics", video: "https://www.youtube.com/watch?v=DXwSIVgZLCI",
        macros: {"servings": 6, "serving": "1 of the creator's 6 servings", "basis": "source", "why": "The source says it makes 6 servings.", "kcal": 121.2, "p": 3.5, "c": 4.7, "f": 10.8},
        makes: "Makes 6 servings", from: DESC,
        ingredients: [
          "½ cup tahini", "3 garlic cloves", "1 tbsp apple cider vinegar", "½ lemon, juiced", "Real salt, to taste", "2–4 tbsp water",
        ],
        note: "The creator's own figures, per serving, are 4 g protein, 5 g carbs and 11 g fat. Mine come out close to that.",
      },
      {
        name: "Cilantro Lime Greek Yogurt Dressing", channel: "Lindsay Pleskot", video: "https://www.youtube.com/watch?v=ItwnD3-bDVE",
        macros: {"servings": 8, "serving": "2 tablespoons (about 30 g)", "basis": "assumed", "why": "Assumed: a dressing serving is 2 tablespoons (about 30 g).", "kcal": 40.5, "p": 3.1, "c": 2.1, "f": 2.3},
        makes: "Makes 1 cup", from: CPAGE,
        ingredients: [
          "1 cup plain Greek yogurt", "1 cup lightly packed fresh cilantro", "1 tbsp olive oil", "1 clove garlic", "Juice of 1 lime", "1 tsp honey", "Salt and pepper, to taste",
        ],
        note: "The page says it makes 1 cup, which is 16 tablespoons, so I used 8 servings of 2 tablespoons. I counted low-fat Greek yogurt. This is the highest-protein dressing here.",
      },
      {
        name: "Spicy Cilantro Yogurt Dressing", channel: "Beyond One Way", video: "https://www.youtube.com/watch?v=aruH5WQrf_k",
        macros: {"servings": 3, "serving": "1 of the creator's 3 servings", "basis": "source", "why": "The source says it makes 3 servings.", "kcal": 190.7, "p": 1.1, "c": 5.1, "f": 18.9},
        makes: "Serves 3", from: DESC,
        ingredients: [
          "½ bunch cilantro (including stems)", "⅓ cup plain yogurt", "¼ cup olive oil", "Juice of ½ lime", "¼ tsp Sriracha sauce", "1 tbsp chopped garlic", "½ tbsp honey", "½ tsp cumin", "¼ tsp salt",
        ],
        note: "The creator lists 3 servings, which is generous for a dressing (about 4 tablespoons each). Use a smaller spoonful to cut the calories.",
      },
      {
        name: "Cilantro Lime Vinaigrette", channel: "Jerry James Stone", video: "https://www.youtube.com/watch?v=CQYQKehqjgI",
        macros: {"servings": 4, "serving": "2 tablespoons (about 30 g)", "basis": "assumed", "why": "Assumed: a dressing serving is 2 tablespoons (about 30 g).", "kcal": 121.3, "p": 0.0, "c": 0.5, "f": 13.5},
        from: DESC,
        ingredients: [
          "2 limes", "4 tbsp olive oil", "¼ cup cilantro, chopped", "4 tsp serrano peppers, minced", "¾ tsp salt", "½ tsp sugar",
        ],
        note: "The creator gives no yield. The juice of 2 limes plus 4 tablespoons of oil is about 8 to 9 tablespoons, so I used 4 servings of 2 tablespoons. Lime juice is counted as zero.",
      },
      {
        name: "Lemon Dijon Vinaigrette", channel: "Foolproof Living", video: "https://www.youtube.com/watch?v=zcNJYfJKFBM",
        macros: {"servings": 4, "serving": "1 of the creator's 4 servings", "basis": "source", "why": "The source says it makes 4 servings.", "kcal": 126.2, "p": 0.4, "c": 0.9, "f": 13.8},
        makes: "Serves 4", from: CPAGE,
        ingredients: [
          "¼ cup extra virgin olive oil", "2 tbsp Dijon mustard", "4 tbsp lemon juice", "1 tbsp balsamic vinegar", "2 cloves garlic", "½ tsp kosher salt", "¼ tsp black pepper",
        ],
        note: "The recipe page says it serves 4. Lemon juice and vinegar are counted as zero.",
      },
      {
        name: "Peanut Dressing", channel: "Green Healthy Cooking", video: "https://www.youtube.com/watch?v=RkLKLWw7KBY",
        macros: {"servings": 3, "serving": "2 tablespoons (about 30 g)", "basis": "assumed", "why": "Assumed: a dressing serving is 2 tablespoons (about 30 g).", "kcal": 81.3, "p": 2.9, "c": 3.3, "f": 6.9},
        from: DESC,
        ingredients: [
          "2 tbsp unsweetened smooth peanut butter", "1 tsp grated ginger", "1 tsp grated garlic", "1 tbsp soy sauce", "1 tsp sesame oil", "1 lime, juiced", "1–2 tbsp water",
        ],
        note: "The creator gives no yield. This is about 6 to 7 tablespoons in all, so I used 3 servings of 2 tablespoons. Soy sauce is salty; go easy if you watch your sodium.",
      },
      {
        name: "Sesame Ginger Dressing", channel: "Whisk Affair", video: "https://www.youtube.com/watch?v=EgedUHIPtOI",
        macros: {"servings": 9, "serving": "2 tablespoons (about 30 g)", "basis": "assumed", "why": "Assumed: a dressing serving is 2 tablespoons (about 30 g).", "kcal": 142.2, "p": 0.4, "c": 4.9, "f": 13.8},
        from: DESC,
        ingredients: [
          "½ cup toasted sesame oil", "1 tbsp extra virgin olive oil", "3 tbsp rice vinegar (regular white vinegar works too)", "2 tbsp soy sauce (tamari for gluten-free)", "3 tbsp maple syrup (honey or agave also works)", "1 tbsp lime juice", "1 clove garlic, minced", "1 tbsp grated ginger", "1 tsp sriracha (or any hot sauce)", "1 tsp toasted sesame seeds",
        ],
        note: "The creator gives no yield. This is about 18 tablespoons in all, so I used 9 servings of 2 tablespoons. It is the richest dressing here, mostly sesame oil; use a light drizzle.",
      },
      {
        name: "Spicy Cashew Dressing (Sweetgreen Style)", channel: "Orianamayo", video: "https://www.youtube.com/watch?v=uy6N-DDo5-4",
        macros: {"servings": 12, "serving": "2 tablespoons (about 30 g)", "basis": "assumed", "why": "Assumed: a dressing serving is 2 tablespoons (about 30 g).", "kcal": 120.2, "p": 1.4, "c": 3.9, "f": 11.5},
        from: DESC,
        ingredients: [
          "½ cup raw cashews, soaked for at least 5 hours", "½ cup olive oil", "⅓ cup water", "2 tbsp coconut aminos", "2 tbsp sriracha", "2 tbsp nutritional yeast", "2 tbsp vinegar (apple cider or rice vinegar)", "2 tbsp minced garlic", "⅓ cup ginger", "1 tbsp maple syrup",
        ],
        note: "A homemade version of the sweetgreen dressing, not the restaurant's own recipe. The creator gives no yield, so I assumed it blends to about 1½ cups (12 servings of 2 tablespoons). The creator lists ⅓ cup of ginger, which is a lot; cut it if that sounds too strong. Sriracha, coconut aminos and vinegar are counted as zero, and nutritional yeast uses USDA's baker's yeast as the closest match. Rich in oil, so use a light drizzle. Keeps about 2 weeks in the fridge.",
      },
    ],
  },
];

