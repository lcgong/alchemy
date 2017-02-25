describe('Protractor Demo App', function() {
  it('should have a title', function() {
    browser.get('http://localhost:8800/');

    expect(browser.getTitle()).toEqual('Angular Project Start');
  });
});
