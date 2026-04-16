/**
 * Predefined review blocks for product review generation
 * Each block contains exactly 5 authentic Pakistani-style reviews
 */

const reviewBlocks = [
  {
    id: 1,
    name: "Skincare Enthusiasts",
    description: "Reviews from skincare-focused users",
    reviews: [
      {
        username: "Ali_Khan92",
        rating: 5,
        comment: "Lightweight and perfect for daily use."
      },
      {
        username: "Sana_Ali_PK",
        rating: 4,
        comment: "Blends nicely, good natural feel."
      },
      {
        username: "Ahmed_Raza786",
        rating: 5,
        comment: "No irritation on sensitive skin."
      },
      {
        username: "ZaraWrites",
        rating: 4,
        comment: "Smooth finish, no white cast."
      },
      {
        username: "Bilal_Official",
        rating: 5,
        comment: "Affordable and effective."
      }
    ]
  },
  {
    id: 2,
    name: "Daily Users",
    description: "Reviews from regular daily product users",
    reviews: [
      {
        username: "Hira_Naz",
        rating: 4,
        comment: "Keeps skin fresh in heat."
      },
      {
        username: "Usman_Dev",
        rating: 5,
        comment: "Absorbs quickly, non-greasy."
      },
      {
        username: "Ayesha_321",
        rating: 4,
        comment: "Soft and natural feel."
      },
      {
        username: "Faisal_K",
        rating: 4,
        comment: "Good for daily protection."
      },
      {
        username: "NoorFatima",
        rating: 5,
        comment: "No oily shine."
      }
    ]
  },
  {
    id: 3,
    name: "Outdoor Enthusiasts",
    description: "Reviews from users who use products outdoors",
    reviews: [
      {
        username: "ImranTech",
        rating: 4,
        comment: "Works well outdoors."
      },
      {
        username: "Mahnoor_Ali",
        rating: 5,
        comment: "Very gentle on skin."
      },
      {
        username: "SaadWrites",
        rating: 4,
        comment: "Decent product overall."
      },
      {
        username: "Kiran_Shaikh",
        rating: 5,
        comment: "Fast absorption."
      },
      {
        username: "Hamza_786",
        rating: 4,
        comment: "Worth the price."
      }
    ]
  },
  {
    id: 4,
    name: "Natural Product Lovers",
    description: "Reviews from users who prefer natural ingredients",
    reviews: [
      {
        username: "Iqra_Official",
        rating: 5,
        comment: "Feels natural and light."
      },
      {
        username: "Adnan_Pk",
        rating: 4,
        comment: "Good but not waterproof."
      },
      {
        username: "Rabia_N",
        rating: 5,
        comment: "No harsh chemicals."
      },
      {
        username: "FarhanLive",
        rating: 4,
        comment: "Nice daily use product."
      },
      {
        username: "Mehwish_K",
        rating: 5,
        comment: "Smooth and fresh feel."
      }
    ]
  },
  {
    id: 5,
    name: "Summer Care Users",
    description: "Reviews from users focused on summer skincare",
    reviews: [
      {
        username: "Danish_Ali",
        rating: 4,
        comment: "Easy to apply."
      },
      {
        username: "Laiba_Writes",
        rating: 5,
        comment: "Keeps skin hydrated."
      },
      {
        username: "Zain_786",
        rating: 5,
        comment: "No stickiness at all."
      },
      {
        username: "Saba_Khan",
        rating: 4,
        comment: "Good for summer days."
      },
      {
        username: "Junaid_Official",
        rating: 5,
        comment: "Best herbal option."
      }
    ]
  },
  {
    id: 6,
    name: "Acne-Prone Skin Users",
    description: "Reviews from users with sensitive/acne-prone skin",
    reviews: [
      {
        username: "Anum_Ali",
        rating: 4,
        comment: "Didn't cause acne."
      },
      {
        username: "Rehan_Pk",
        rating: 5,
        comment: "Better than expected."
      },
      {
        username: "Areeba_Naz",
        rating: 4,
        comment: "Smooth but needs reapply."
      },
      {
        username: "Shahzaib_Dev",
        rating: 5,
        comment: "Very lightweight."
      },
      {
        username: "Nida_Official",
        rating: 4,
        comment: "Good for sensitive skin."
      }
    ]
  },
  {
    id: 7,
    name: "Budget-Conscious Users",
    description: "Reviews from value-focused customers",
    reviews: [
      {
        username: "Talha_786",
        rating: 5,
        comment: "Affordable and nice."
      },
      {
        username: "Komal_Khan",
        rating: 4,
        comment: "Slightly dry but good."
      },
      {
        username: "Arslan_Pk",
        rating: 5,
        comment: "Refreshing feel."
      },
      {
        username: "Maham_Ali",
        rating: 5,
        comment: "Safe natural ingredients."
      },
      {
        username: "UsamaWrites",
        rating: 4,
        comment: "Good daily sunscreen."
      }
    ]
  },
  {
    id: 8,
    name: "Quality Seekers",
    description: "Reviews from users who prioritize product quality",
    reviews: [
      {
        username: "Hassan_Raza",
        rating: 5,
        comment: "No white layer."
      },
      {
        username: "Zoya_Naz",
        rating: 4,
        comment: "Soft skin feel."
      },
      {
        username: "Adeel_Official",
        rating: 5,
        comment: "Great outdoors."
      },
      {
        username: "Sidra_K",
        rating: 4,
        comment: "Gentle and smooth."
      },
      {
        username: "Waqar_Pk",
        rating: 5,
        comment: "Very good product."
      }
    ]
  },
  {
    id: 9,
    name: "Herbal Product Users",
    description: "Reviews from users who prefer herbal products",
    reviews: [
      {
        username: "Fiza_Ali",
        rating: 5,
        comment: "Perfect daily use."
      },
      {
        username: "Asad_786",
        rating: 4,
        comment: "Needs reapplication."
      },
      {
        username: "Minal_Khan",
        rating: 5,
        comment: "Nice herbal scent."
      },
      {
        username: "Irfan_Pk",
        rating: 4,
        comment: "Not for extreme sun."
      },
      {
        username: "Neha_Official",
        rating: 5,
        comment: "Fresh glowing skin."
      }
    ]
  },
  {
    id: 10,
    name: "Value Seekers",
    description: "Reviews from price-conscious quality seekers",
    reviews: [
      {
        username: "Saif_Raza",
        rating: 5,
        comment: "No irritation."
      },
      {
        username: "Aqsa_Khan",
        rating: 4,
        comment: "Light and smooth."
      },
      {
        username: "Zubair_Dev",
        rating: 5,
        comment: "Works in heat."
      },
      {
        username: "Huma_Ali",
        rating: 4,
        comment: "Slightly pricey."
      },
      {
        username: "Dawood_786",
        rating: 5,
        comment: "Great value."
      }
    ]
  },
  {
    id: 11,
    name: "Comfort Seekers",
    description: "Reviews from users who prioritize comfort and ease",
    reviews: [
      {
        username: "Noreen_K",
        rating: 5,
        comment: "Keeps skin cool."
      },
      {
        username: "Faizan_Pk",
        rating: 4,
        comment: "Mild but good."
      },
      {
        username: "Bushra_Ali",
        rating: 5,
        comment: "No side effects."
      },
      {
        username: "Owais_Official",
        rating: 4,
        comment: "Simple product."
      },
      {
        username: "Iqbal_Raza",
        rating: 5,
        comment: "Comfortable wear."
      }
    ]
  },
  {
    id: 12,
    name: "Practical Users",
    description: "Reviews from practical, no-nonsense users",
    reviews: [
      {
        username: "Sehrish_Khan",
        rating: 4,
        comment: "Not waterproof."
      },
      {
        username: "Kamran_Dev",
        rating: 5,
        comment: "Good daily use."
      },
      {
        username: "Afia_Naz",
        rating: 5,
        comment: "Very light."
      },
      {
        username: "Salman_786",
        rating: 4,
        comment: "Decent SPF."
      },
      {
        username: "Lubna_Ali",
        rating: 5,
        comment: "Clean finish."
      }
    ]
  },
  {
    id: 13,
    name: "Protection Focused",
    description: "Reviews from users who prioritize skin protection",
    reviews: [
      {
        username: "Parveen_K",
        rating: 5,
        comment: "Good protection."
      },
      {
        username: "Rizwan_Pk",
        rating: 4,
        comment: "Easy application."
      },
      {
        username: "Hadia_Ali",
        rating: 5,
        comment: "Nice texture."
      },
      {
        username: "Imad_Official",
        rating: 4,
        comment: "Light feel."
      },
      {
        username: "Samina_Khan",
        rating: 5,
        comment: "No breakouts."
      }
    ]
  },
  {
    id: 14,
    name: "Sun Protection Users",
    description: "Reviews from users who need strong sun protection",
    reviews: [
      {
        username: "Tariq_786",
        rating: 5,
        comment: "Works in strong sun."
      },
      {
        username: "Anaya_Ali",
        rating: 4,
        comment: "Smooth and soft."
      },
      {
        username: "Yasir_Pk",
        rating: 5,
        comment: "Affordable option."
      },
      {
        username: "Hafsa_K",
        rating: 4,
        comment: "No oily shine."
      },
      {
        username: "Shahid_Official",
        rating: 5,
        comment: "Good daily use."
      }
    ]
  },
  {
    id: 15,
    name: "Fresh Skin Seekers",
    description: "Reviews from users who want fresh, healthy skin",
    reviews: [
      {
        username: "Momina_Ali",
        rating: 5,
        comment: "Herbal feel is nice."
      },
      {
        username: "Naveed_Dev",
        rating: 4,
        comment: "Good quality."
      },
      {
        username: "Sahar_Khan",
        rating: 5,
        comment: "Blends quickly."
      },
      {
        username: "Javeria_Ali",
        rating: 4,
        comment: "Light texture."
      },
      {
        username: "Bilquis_Pk",
        rating: 5,
        comment: "Skin feels fresh."
      }
    ]
  },
  {
    id: 16,
    name: "Happy Customers",
    description: "Reviews from satisfied repeat customers",
    reviews: [
      {
        username: "Qasim_786",
        rating: 5,
        comment: "Worth buying."
      },
      {
        username: "Tehmina_K",
        rating: 4,
        comment: "Soft finish."
      },
      {
        username: "Haroon_Pk",
        rating: 5,
        comment: "Good outdoors."
      },
      {
        username: "Aiman_Ali",
        rating: 4,
        comment: "Natural feel."
      },
      {
        username: "Sohail_Official",
        rating: 5,
        comment: "Happy purchase."
      }
    ]
  },
  {
    id: 17,
    name: "Reliable Users",
    description: "Reviews from consistent, reliable product users",
    reviews: [
      {
        username: "Rida_Khan",
        rating: 5,
        comment: "Works daily."
      },
      {
        username: "Asif_786",
        rating: 4,
        comment: "Light and effective."
      },
      {
        username: "Mehreen_Ali",
        rating: 5,
        comment: "No irritation."
      },
      {
        username: "Zeeshan_Pk",
        rating: 4,
        comment: "Good texture."
      },
      {
        username: "Khadija_K",
        rating: 5,
        comment: "Safe to use."
      }
    ]
  },
  {
    id: 18,
    name: "Easy Application Users",
    description: "Reviews from users who value easy application",
    reviews: [
      {
        username: "Nasir_Official",
        rating: 4,
        comment: "Easy to apply."
      },
      {
        username: "Arooj_Ali",
        rating: 5,
        comment: "Smooth finish."
      },
      {
        username: "Farooq_786",
        rating: 4,
        comment: "Good protection."
      },
      {
        username: "Sidra_Pk",
        rating: 5,
        comment: "Not greasy."
      },
      {
        username: "Waseem_K",
        rating: 4,
        comment: "Affordable."
      }
    ]
  },
  {
    id: 19,
    name: "Summer Skincare Users",
    description: "Reviews from users focused on summer skin benefits",
    reviews: [
      {
        username: "Nimra_Ali",
        rating: 5,
        comment: "Fresh skin feel."
      },
      {
        username: "Adil_Official",
        rating: 4,
        comment: "Decent product."
      },
      {
        username: "Rubab_Khan",
        rating: 5,
        comment: "Great for summer."
      },
      {
        username: "Shan_786",
        rating: 4,
        comment: "Herbal benefit."
      },
      {
        username: "Sumbul_Ali",
        rating: 5,
        comment: "Soft texture."
      }
    ]
  },
  {
    id: 20,
    name: "Satisfied Customers",
    description: "Reviews from completely satisfied customers",
    reviews: [
      {
        username: "Ilyas_Pk",
        rating: 4,
        comment: "Works fine daily."
      },
      {
        username: "Kashif_Official",
        rating: 5,
        comment: "Simple and nice."
      },
      {
        username: "Maria_Khan",
        rating: 4,
        comment: "Good for sensitive skin."
      },
      {
        username: "Tanveer_786",
        rating: 5,
        comment: "Value for money."
      },
      {
        username: "Uzma_Ali",
        rating: 5,
        comment: "Fully satisfied."
      }
    ]
  }
];

module.exports = reviewBlocks;