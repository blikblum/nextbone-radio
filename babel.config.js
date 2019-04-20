
module.exports = {   
  presets: [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": [
            "ie 11"
          ]
        }
      }
    ]
  ],
  plugins: [
    "@babel/plugin-proposal-object-rest-spread"
  ],
  overrides: [
    {     
      test: /nextbone.js$/
    }
  ] 
};