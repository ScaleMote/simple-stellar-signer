/// <reference types="cypress" />

describe('Connect', () => {
    beforeEach(() => {
        cy.visit('/connect');
        cy.wait(5000);
        cy.get('.wallet-title').contains('xBull').as('xBullTitle');
        cy.get('.wallet-title').contains('Freighter').as('freighterTitle');
        cy.get('.wallet-title').contains('Albedo').as('albedoTitle');
        cy.get('.wallet-title').contains('Private Key').as('privateKeyTitle');
        cy.get('.wallet-title').contains('Rabet').as('rabetTitle');
        cy.get('.wallet-title').contains('Private Key').as('privateKeyBtn');
        cy.get('.simple-signer-container').as('container');
    });

    it("Should check if there's five connect methods", () => {
        cy.get('@privateKeyTitle').should('contain.text', 'Private Key');
        cy.get('@freighterTitle').should('contain.text', 'Freighter');
        cy.get('@albedoTitle').should('contain.text', 'Albedo');
        cy.get('@xBullTitle').should('contain.text', 'xBull');
        cy.get('@rabetTitle').should('contain.text', 'Rabet');
    });

    it('Should show the private key connect method', () => {
        cy.get('@privateKeyBtn').click();
        cy.get('.private-key-title').should('contain.text', 'Private Key');
        cy.get('.connect-btn').should('contain.text', 'Connect');
        cy.get('.cancel-btn').should('contain.text', 'Cancel');
    });

    it('Should return to the four connect methods', () => {
        cy.get('@privateKeyBtn').click();
        cy.get('@container').should('contain.text', 'Connect');
        cy.get('.cancel-btn').click();
        cy.wait(5000);
        cy.get('@privateKeyTitle').should('contain.text', 'Private Key');
        cy.get('@freighterTitle').should('contain.text', 'Freighter');
        cy.get('@albedoTitle').should('contain.text', 'Albedo');
        cy.get('@xBullTitle').should('contain.text', 'xBull');
        cy.get('@rabetTitle').should('contain.text', 'Rabet');
    });
});
