describe('Login Flow', () => {
  it('should successfully log in with valid credentials', () => {
    // Visit the login page
    cy.visit('http://localhost:5173/login')

    // Verify the page loaded by checking for the logo or header
    cy.get('h1').contains('FormsNur')

    // Mock the API calls for login and me
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: { id: 1, email: 'admin@nur.edu.bo', role: 'admin', name: 'Admin' }
      }
    }).as('loginRequest')

    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: { id: 1, email: 'admin@nur.edu.bo', role: 'admin', name: 'Admin' }
    }).as('meRequest')

    // Fill in the email and password
    cy.get('input#email').type('admin@nur.edu.bo')
    cy.get('input#password').type('admin123')

    // Click the login button
    cy.get('button#loginBtn').click()

    // Wait for the login request to be intercepted
    cy.wait('@loginRequest')

    // Assert that we are navigated away from login (to Dashboard)
    cy.url().should('not.include', '/login')
  })
})
