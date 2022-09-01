describe("index spec", () => {
  it("passes", () => {
    cy.visit("/").contains("Funding");
    cy.visit("/").contains("Martin Moshal");
  });
});
