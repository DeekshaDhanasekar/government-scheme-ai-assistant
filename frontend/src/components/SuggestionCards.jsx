import { useState } from "react";

function SuggestionCards({ onQuestionClick }) {

  const [expanded, setExpanded] = useState(null);

  const schemes = [
    {
      id: "pmkisan",
      icon: "🌾",
      title: "PM-KISAN",
      description: "Income support scheme for farmers",
      questions: [
        "What is PM-KISAN scheme?",
        "Who is eligible for PM-KISAN?",
        "How much financial assistance is provided under PM-KISAN?"
      ]
    },

    {
      id: "pmfby",
      icon: "🌧",
      title: "PMFBY",
      description: "Understand crop insurance benefits",
      questions: [
        "What is PMFBY scheme?",
        "Who can apply for crop insurance?",
        "What crops are covered under PMFBY?"
      ]
    },

    {
      id: "kcc",
      icon: "💳",
      title: "Kisan Credit Card",
      description: "Agricultural loans and credit support",
      questions: [
        "What is Kisan Credit Card?",
        "Who is eligible for KCC?",
        "How can farmers apply for KCC?"
      ]
    }
  ];


  return (
    <div className="space-y-4 mt-6">

      {schemes.map((scheme)=>(
        <div
          key={scheme.id}
          className="
          bg-white 
          rounded-2xl 
          shadow-md 
          border
          p-5
          cursor-pointer
          hover:shadow-lg
          transition
          "
          onClick={() =>
            setExpanded(
              expanded === scheme.id ? null : scheme.id
            )
          }
        >

          <div className="flex items-center gap-4">

            <div className="text-3xl">
              {scheme.icon}
            </div>

            <div>
              <h2 className="font-semibold text-lg">
                {scheme.title}
              </h2>

              <p className="text-gray-500 text-sm">
                {scheme.description}
              </p>
            </div>

          </div>


          {expanded === scheme.id && (

            <div className="mt-5 space-y-2">

              {
                scheme.questions.map((question,index)=>(

                  <button
                    key={index}
                    onClick={(e)=>{
                      e.stopPropagation();
                      onQuestionClick(question);
                    }}
                    className="
                    w-full
                    text-left
                    bg-gray-100
                    hover:bg-gray-200
                    rounded-xl
                    p-3
                    text-sm
                    transition
                    "
                  >
                    {question}
                  </button>

                ))
              }

            </div>

          )}

        </div>
      ))}

    </div>
  );
}


export default SuggestionCards;