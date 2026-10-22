import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";
import { motion } from "framer-motion";


function Message({ message }) {

  const isUser = message.role === "user";


  return (

    <motion.div

      initial={{
        opacity:0,
        y:10
      }}

      animate={{
        opacity:1,
        y:0
      }}

      className={`
        flex
        gap-4
        p-5
        ${
          isUser
          ? "bg-white"
          : "bg-gray-50"
        }
      `}

    >


      {/* Avatar */}

      <div>

        {
          isUser ?

          <div className="
            bg-gray-700
            text-white
            rounded-full
            p-2
          ">
            <User size={18}/>
          </div>

          :

          <div className="
            bg-black
            text-white
            rounded-full
            p-2
          ">
            <Bot size={18}/>
          </div>

        }

      </div>



      {/* Message */}

      <div className="
        max-w-3xl
        leading-7
      ">


        <p className="
          font-semibold
          mb-1
        ">

          {
            isUser
            ? "You"
            : "Government AI"
          }

        </p>



        <ReactMarkdown>

          {message.text}

        </ReactMarkdown>


      </div>



    </motion.div>

  );

}


export default Message;