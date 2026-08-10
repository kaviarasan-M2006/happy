export interface BirthdayQuote {
  text: string;
  category: string;
}

export const multilingualQuotes: Record<string, Record<string, BirthdayQuote[]>> = {
  en: {
    "Sweet & Simple": [
      { text: "May your life be filled with happiness, love, success, and unforgettable memories. Happy Birthday!", category: "Sweet & Simple" },
      { text: "Wishing you a day filled with laughter, love, and all the things that make you smile. Have a fantastic birthday!", category: "Sweet & Simple" },
      { text: "May this special day bring you endless joy and tons of precious memories. Happy Birthday!", category: "Sweet & Simple" }
    ],
    "Deep & Emotional": [
      { text: "On your special day, I wish you all the joy your heart can hold, all the smiles a day can bring, and all the blessings a life can unfold.", category: "Deep & Emotional" },
      { text: "Having you in my life is a true blessing. Thank you for being such an amazing soul. Happy Birthday!", category: "Deep & Emotional" },
      { text: "You shine so bright in this universe. May your year ahead be as beautiful and loving as you are.", category: "Deep & Emotional" }
    ],
    "Inspirational & Meaningful": [
      { text: "Count your life by smiles, not tears. Count your age by friends, not years. Happy Birthday!", category: "Inspirational & Meaningful" },
      { text: "The best is yet to come. Dream big, shine bright, and make this year your most magnificent one yet. Happy Birthday!", category: "Inspirational & Meaningful" },
      { text: "May you continue to grow, inspire, and create a beautiful universe around you. Wishing you the happiest of birthdays!", category: "Inspirational & Meaningful" }
    ]
  },
  ta: {
    "Sweet & Simple": [
      { text: "உங்களுக்கு எனது இனிய பிறந்தநாள் நல்வாழ்த்துக்கள்! இந்த ஆண்டு உங்கள் வாழ்வில் மகிழ்ச்சியும், வெற்றியும், ஆரோக்கியமும் பெருகட்டும்!", category: "Sweet & Simple" },
      { text: "வாழ்க வளமுடன்! இந்த பிறந்தநாளில் உங்கள் கனவுகள் அனைத்தும் நனவாக வாழ்த்துகிறேன்!", category: "Sweet & Simple" },
      { text: "உங்களது இந்த பிறந்தநாள் எப்போதையும் விட மிகவும் ஸ்பெஷலானதாக அமையட்டும். இனிய பிறந்தநாள் வாழ்த்துக்கள்!", category: "Sweet & Simple" }
    ],
    "Deep & Emotional": [
      { text: "என் வாழ்வில் நீங்கள் இருப்பது ஒரு பெரிய வரம். உங்கள் அன்புக்கும் ஆதரவுக்கும் நன்றி. இனிய பிறந்தநாள் வாழ்த்துக்கள்!", category: "Deep & Emotional" },
      { text: "ஒவ்வொரு நொடியும் உங்கள் முகம் புன்னகையால் மலரட்டும். உங்களை போன்ற ஒரு நல்ல இதயம் கொண்டவருக்கு என் அன்பான பிறந்தநாள் வாழ்த்துக்கள்!", category: "Deep & Emotional" }
    ],
    "Inspirational & Meaningful": [
      { text: "துணிச்சலுடன் புதிய உயரங்களை எட்டிப்பிடிக்க என் வாழ்த்துக்கள். இந்த பிறந்தநாள் உங்களுக்கு ஒரு புதிய தொடக்கமாக அமையட்டும்!", category: "Inspirational & Meaningful" },
      { text: "வாழ்க்கை என்பது ஒரு பயணம். அதில் உங்கள் ஒவ்வொரு நாளும் புதுமையான சாதனைகளோடு மலரட்டும். இனிய பிறந்தநாள் வாழ்த்துக்கள்!", category: "Inspirational & Meaningful" }
    ]
  },
  hi: {
    "Sweet & Simple": [
      { text: "आपको जन्मदिन की हार्दिक शुभकामनाएं! भगवान आपके जीवन में खुशियां, तरक्की और अच्छी सेहत लाएं।", category: "Sweet & Simple" },
      { text: "यह खास दिन आपके जीवन में ढेर सारी खुशियां और मीठी यादें लेकर आए। जनमदिन मुबारक हो!", category: "Sweet & Simple" },
      { text: "मुस्कुराते रहें आप हर दम, यही दुआ है हमारी रब से। जन्मदिन की ढेर सारी शुभकामनाएं!", category: "Sweet & Simple" }
    ],
    "Deep & Emotional": [
      { text: "आप हमारे जीवन के अनमोल रत्न हैं। आपके होने से हमारे जीवन में खुशियां हैं। जन्मदिन की बधाई!", category: "Deep & Emotional" },
      { text: "दुआ है कि आपकी हर ख्वाहिश पूरी हो, और आपका जीवन हमेशा प्यार और खुशी से महकता रहे। जनमदिन मुबारक!", category: "Deep & Emotional" }
    ],
    "Inspirational & Meaningful": [
      { text: "अपने सपनों को सच करने का यह सफर यूं ही चलता रहे। कामयाबी आपके कदम चूमे। जन्मदिन की हार्दिक शुभकामनाएं!", category: "Inspirational & Meaningful" },
      { text: "हर दिन एक नया अवसर है। आशा है कि यह नया साल आपके जीवन में सफलता की नई ऊंचाइयों को छूने में मदद करेगा। जन्मदिन की बधाई!", category: "Inspirational & Meaningful" }
    ]
  },
  te: {
    "Sweet & Simple": [
      { text: "మీకు పుట్టినరోజు శుభాకాంక్షలు! ఈ సంవత్సరం మీకు సంతోషం, విజయం మరియు మంచి ఆరోగ్యం కలగాలని కోరుకుంటున్నాను.", category: "Sweet & Simple" },
      { text: "ఈ ప్రత్యేకమైన రోజు మీ జీవితంలో మరెన్నో సంతోషకరమైన క్షణాలను నింపాలని ఆశిస్తున్నాను. హ్యాపీ బర్త్ డే!", category: "Sweet & Simple" }
    ],
    "Deep & Emotional": [
      { text: "నా జీవితంలో మీరు ఒక ప్రత్యేకమైన వ్యక్తి. మీతో ఉన్న ప్రతి క్షణం ఎంతో విలువైనది. పుట్టినరోజు శుభాకాంక్షలు!", category: "Deep & Emotional" },
      { text: "మీ ముఖంలో ఈ చిరునవ్వు ఎల్లప్పుడూ ఇలాగే ఉండాలని మనస్ఫూర్తిగా కోరుకుంటూ... హ్యాపీ బర్త్ డే!", category: "Deep & Emotional" }
    ],
    "Inspirational & Meaningful": [
      { text: "ఈ కొత్త సంవత్సరం మీ లక్ష్యాలను చేరుకోవడానికి మరిన్ని అవకాశాలను తీసుకురావాలని కోరుకుంటున్నాను. జన్మదిన శుభాకాంక్షలు!", category: "Inspirational & Meaningful" }
    ]
  },
  ml: {
    "Sweet & Simple": [
      { text: "ഹൃദയം നിറഞ്ഞ ജന്മദിനാശംസകൾ! ഈ വർഷം നിങ്ങളുടെ ജീവിതത്തിൽ സന്തോഷവും വിജയവും ആരോഗ്യവും നിറയ്ക്കട്ടെ.", category: "Sweet & Simple" },
      { text: "നിങ്ങളുടെ എല്ലാ സ്വപ്നങ്ങളും യാഥാർത്ഥ്യമാകാൻ ഈ ജന്മദിനത്തിൽ ആശംസിക്കുന്നു. ജന്മദിനാശംസകൾ!", category: "Sweet & Simple" }
    ],
    "Deep & Emotional": [
      { text: "എന്റെ ജീവിതത്തിലെ ഏറ്റവും വലിയ ഭാഗ്യമാണ് നിങ്ങൾ. എപ്പോഴും സന്തോഷമായിരിക്കട്ടെ. സ്നേഹം നിറഞ്ഞ ജന്മദിനാശംസകൾ!", category: "Deep & Emotional" }
    ],
    "Inspirational & Meaningful": [
      { text: "പുതിയ ഉയരങ്ങൾ കീഴടക്കാനും വിജയം വരിക്കാനും ഈ ജന്മദിനം ഒരു തുടക്കമാകട്ടെ. ആശംസകൾ!", category: "Inspirational & Meaningful" }
    ]
  },
  kn: {
    "Sweet & Simple": [
      { text: "ನಿಮಗೆ ಹುಟ್ಟುಹಬ್ಬದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು! ಈ ವರ್ಷ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸುಖ, ಶಾಂತಿ ಮತ್ತು ಯಶಸ್ಸು ತುಂಬಲಿ.", category: "Sweet & Simple" },
      { text: "ನಿಮ್ಮ ಈ ವಿಶೇಷ ದಿನವು ಅತ್ಯಂತ ಸುಂದರವಾದ ನೆನಪುಗಳನ್ನು ತರಲಿ ಎಂದು ಹಾರೈಸುತ್ತೇನೆ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", category: "Sweet & Simple" }
    ],
    "Deep & Emotional": [
      { text: "ನನ್ನ ಜೀವನದಲ್ಲಿ ನಿಮ್ಮ ಉಪಸ್ಥಿತಿ ಅತ್ಯಂತ ಅಮೂಲ್ಯವಾದುದು. ದೇವರು ನಿಮಗೆ ಸದಾ ಕಾಲ ಒಳಿತನ್ನು ಮಾಡಲಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", category: "Deep & Emotional" }
    ],
    "Inspirational & Meaningful": [
      { text: "ನಿಮ್ಮ ಕನಸುಗಳೆಲ್ಲವೂ ಈ ವರ್ಷ ನನಸಾಗಲಿ, ಯಶಸ್ಸು ನಿಮ್ಮದಾಗಲಿ ಎಂದು ಹಾರೈಸುತ್ತೇನೆ. ಹುಟ್ಟುಹಬ್ಬದ ಹಾರ್ದಿಕ ಶುഭാಶಯಗಳು!", category: "Inspirational & Meaningful" }
    ]
  },
  bn: {
    "Sweet & Simple": [
      { text: "তোমাকে জন্মদিনের অনেক অনেক শুভেচ্ছা! আগামী বছরটি তোমার জীবনে সুখ, সমৃদ্ধি ও অনাবিল আনন্দ নিয়ে আসুক।", category: "Sweet & Simple" },
      { text: "এই বিশেষ দিনটি তোমার জীবনে বয়ে আনুক অনেক হাসি ও সুন্দর স্মৃতি। শুভ জন্মদিন!", category: "Sweet & Simple" }
    ],
    "Deep & Emotional": [
      { text: "তুমি আমার জীবনের এক বিশেষ মানুষ। তোমার এই জন্মদিনটি ভালোবাসায় ভরে উঠুক। জন্মদিনের অনেক শুভেচ্ছা!", category: "Deep & Emotional" }
    ],
    "Inspirational & Meaningful": [
      { text: "তোমার জীবনের প্রতিটি স্বপ্ন সত্যি হোক, তুমি সফলতার চরম শিখরে পৌঁছাও। শুভ জন্মদিন!", category: "Inspirational & Meaningful" }
    ]
  }
};
