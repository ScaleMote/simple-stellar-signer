/// <reference types="cypress" />
/// <reference types="@testing-library/cypress"/>
import { sourceAccount, paymentRecipient } from '../../fixtures/sign.json';
import { paymentXdr, signedXdr, multiSignedXdr } from '../../fixtures/operations.json';

describe('checks that the /sign component works', () => {
    const url = Cypress.env('HOST');
    it('should visit /sign with xdr valid but user is not connected', () => {
        cy.visit(`${url}/sign?xdr=${paymentXdr}`);
        cy.get('.user-not-connected').contains('User is not connected');
        cy.get('.connect-btn').click();
        cy.url().should('include', '/connect');
    });

    it('should render a transaction if XDR query parameter is valid', () => {
        window.localStorage.setItem('xbull', '1234');
        cy.visit(`${url}sign?xdr=${paymentXdr}`);
        cy.get('.src-account').contains(sourceAccount);
        cy.get('.payment-operation').contains(paymentRecipient);


    it('should render an error if xdr is invalid', () => {
        cy.visit(url);
        cy.get('a[href*="sign"]').click();
        cy.findByText('INVALID OR NULL XDR').should('exist');
    });

    it('should render a signature if the tx also have', () => {
        cy.visit(`${url}/sign?xdr=${signedXdr}`);
        cy.get('.tx-signatures').contains('Hint: GCQDITCYUFWA');
    });

    it('should render two signatures if the xdr also have', () => {
        cy.visit(`${url}/sign?xdr=${multiSignedXdr}`);
        cy.get('.tx-signatures').children().should('have.length', 2);
    });
});
