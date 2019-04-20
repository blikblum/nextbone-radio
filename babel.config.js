
module.exports = {   
  presets: [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": [
            "chrome 60"
          ]
        }
      }
    ]
  ],
  overrides: [
    {     
      test: /nextbone.js$/
    }
  ] 
};