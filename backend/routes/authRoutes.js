const express = require("express");
const axios = require("axios");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require('../models/User');

const {signUp,login,sendOTP,verifyOTP,googleSignIn} = require('../controller/authController');
  
  router.post('/signup', signUp);
  router.post('/login', login);
  router.post('/forgot-password', sendOTP);
  router.post('/verify-otp', verifyOTP);
  router.post('/google', googleSignIn);
  
  const authenticateUser = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ message: "No token provided" });
  
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized", error: err.message });
    }
  };
  
  router.get("/cryptos",authenticateUser, async (req, res) => {
    //res.send("Crypto route works");
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      const symbols = user.cryptos;
      const ids = symbols.join(',');
      const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets`,
          {
              params: {
                  vs_currency: 'usd',
                  ids: ids,
                  price_change_percentage: '1h,24h,7d',
              }
          }
      );
      const data = response.data.map((coin) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          image: coin.image,
          current_price: coin.current_price,
          price_change_percentage_1h_in_currency: coin.price_change_percentage_1h_in_currency,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
      }));
      res.json(data);
  } catch (err) {
      console.error("Error fetching crypto data:", err.message);
      res.status(500).json({ message: "Internal server error" });
  }
});
  
  // router.post("/cryptos/add", authenticateUser, async (req, res) => {
  //   try {
  //     const { symbol } = req.body;
  //     const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${symbol}`);
  //     req.user.cryptos.push(symbol);
  //     await req.user.save();
  //     res.json({ message: "Cryptocurrency added successfully" });
  //   }catch(err){
  //     if(err.response?.status === 404){
  //       res.status(400).json({ error: "Cryptocurrency not found. Please check the symbol." });
  //     }
  //     else{
  //       console.error("Error adding crypto:", err);
  //       res.status(500).json({ error: "Failed to add cryptocurrency" });
  //     }
  //   }
  // });

  router.post("/crypto/add", authenticateUser, async (req, res) => {
    try {
      const { symbol } = req.body;
      if (!symbol || typeof symbol !== 'string') {
        return res.status(400).json({ message: "Valid symbol is required" });
      }
      const coinId = symbol.toLowerCase();
      let coinDetails;
      try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets`, {
          params: {
            vs_currency: 'usd',
            ids: coinId,
          }
        });
        if (!response.data || response.data.length === 0) {
          return res.status(404).json({
            message: `Coin with ID "${symbol}" not found.`,
            suggestions: [
              'Use the official CoinGecko ID like "bitcoin", "solana", "usd-coin"',
              'Use the popup search to find the correct ID'
            ]
          });
        }
        coinDetails = response.data[0];
      } catch (err) {
        console.error("Coin fetch failed:", err.message);
        return res.status(500).json({
          message: "Failed to fetch coin details",
          error: err.message,
          details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
      }
      if (!req.user.cryptos.includes(coinDetails.id)) {
        req.user.cryptos.push(coinDetails.id);
        await req.user.save();
      }
      res.json({
        success: true,
        message: `Added ${coinDetails.name} (${coinDetails.symbol.toUpperCase()})`,
        data: {
          id: coinDetails.id,
          symbol: coinDetails.symbol,
          name: coinDetails.name
        }
      });
  
    } catch (err) {
      console.error("Add error:", err);
      res.status(500).json({
        message: "Failed to add cryptocurrency",
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  });
  

  router.get("/crypto/search", authenticateUser, async (req, res) => {
    try {
      const query = req.query.query?.toLowerCase() || "";
      if (!query) return res.json([]);
      const response = await axios.get(`https://api.coingecko.com/api/v3/search?query=${query}`);
      const result = response.data.coins.map((coin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol
      }));
      res.json(result.slice(0, 10));
    } catch (err) {
      console.error("Search failed:", err);
      res.status(500).json({ 
        message: "Search failed", 
        error: err.message 
      });
    }
  });

router.delete("/crypto/delete/:symbol", authenticateUser, async (req, res) => {
  try {
    const { symbol } = req.params;
    // console.log(`Delete request for symbol: ${symbol}`);
    // console.log(`User's current cryptos:`, req.user.cryptos);
    const index = req.user.cryptos.findIndex(
      (coin) => coin.toLowerCase() === symbol.toLowerCase()
    );
    if (index === -1) {
      console.log('Symbol not found in user list');
      return res.status(404).json({ 
        success: false,
        message: `"${symbol}" not found in your portfolio.`,
        yourCoins: req.user.cryptos,
        suggestion: `Try using the exact symbol from your list.`
      });
    }
    req.user.cryptos.splice(index, 1);
    req.user.markModified("cryptos");
    await req.user.save();
    res.status(200).json({
      success: true,
      message: `${symbol} removed successfully.`,
      remainingCoins: req.user.cryptos
    });
    
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({
      success: false,
      message: "Server error during deletion",
      error: err.message
    });
  }
});
  
  module.exports = router;
  