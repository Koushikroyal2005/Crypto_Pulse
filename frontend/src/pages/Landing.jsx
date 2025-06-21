import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GrBitcoin } from "react-icons/gr";
import { AiOutlineStock } from "react-icons/ai";
import { CgChevronDoubleRight } from "react-icons/cg";
import { VscDebugContinue } from "react-icons/vsc";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "📊",
      title: "Real-time Data",
      description: "Live price updates and market movements"
    },
    {
      icon: "🔔",
      title: "Custom Alerts",
      description: "Set notifications for price thresholds"
    },
    {
      icon: "📈",
      title: "Advanced Charts",
      description: "Interactive tools for technical analysis"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl text-center mb-12"
        >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 flex items-center justify-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Crypto
                </span>
                <span className="text-gray-900">Pulse</span>
                <GrBitcoin className="text-amber-400 text-4xl" />
            </h1>
            <p className="text-lg md:text-xl text-gray-800 mb-8 leading-relaxed">
                Your gateway to real-time cryptocurrency insights. Track market trends, 
                manage your portfolio, and stay ahead with our comprehensive analytics platform.
            </p>
            <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl font-extrabold tracking-wide text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-amber-500 to-gray-800 drop-shadow-lg"
            >
            Track Daily — Raise Up <AiOutlineStock className="text-green-500 text-4xl inline-block"/>
            </motion.h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -5 }}
              className="bg-gray-100 backdrop-blur-sm p-6 rounded-xl border border-black shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-mono text-gray-800 mb-2 font-bold">{feature.title}</h3>
              <p className="text-gray-800 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
            className="relative overflow-hidden px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span className="relative z-10">Get Started<CgChevronDoubleRight className="inline-block text-2xl"/></span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-lg bg-white border-2 border-blue-600 text-blue-600 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-50"
          >
            Sign In <VscDebugContinue className="inline-block text-black"/>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
