describe('When Radio is attached to your application', function() {
  it('should attach itself to Backbone.Radio', function() {
    expect(Backbone.Radio).to.exist;
  });

  it('should have the channel method', function() {
    expect(Backbone.Radio.channel).to.exist;
  });

  it('should have the Channel Class attached to it', function() {
    expect(Backbone.Radio.Channel).to.exist;
  });
});
