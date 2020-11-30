describe("Voting", () => {
  it("displays 'random' two dogs", () => {
    cy.visit("/");

    cy.contains("who's the best dog?").should("exist");
    cy.contains("This dog is the most 13/10").click();

    cy.server();
    cy.route({
      url: "/api/compare",
      onRequest: () => {
        cy.get('[role="progressbar"]').should("exist");
      },
    });
  });
});
