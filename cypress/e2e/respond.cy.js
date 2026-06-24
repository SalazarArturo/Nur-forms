describe('Respond Page Flow', () => {
  it('should load a form and submit answers successfully', () => {
    // Mock the form data
    cy.intercept('GET', '/api/forms/public/1', {
      statusCode: 200,
      body: {
        id: 1,
        title: 'Formulario de Prueba',
        description: 'Descripción de prueba',
        welcome_message: 'Bienvenido al formulario de prueba',
        primary_color: '#1d4ed8',
        questions: [
          {
            id: 101,
            type: 'short_text',
            text: '¿Cuál es tu nombre?',
            is_required: true,
            config: { placeholder: 'Tu respuesta...' }
          }
        ]
      }
    }).as('getForm')

    cy.intercept('POST', '/api/submissions/form/1/start', {
      statusCode: 200,
      body: {
        id: 999,
        respondent_token: 'fake-respondent-token'
      }
    }).as('startSubmission')

    cy.intercept('PATCH', '/api/submissions/999/answers', {
      statusCode: 200,
      body: {}
    }).as('saveAnswers')

    cy.intercept('PATCH', '/api/submissions/999/submit', {
      statusCode: 200,
      body: {}
    }).as('submitForm')

    // Visit the respond page for form ID 1
    cy.visit('http://localhost:5173/responder/1')

    // Wait for the form to load
    cy.wait('@getForm')

    // Check welcome message and click start
    cy.contains('Bienvenido al formulario de prueba').should('be.visible')
    cy.contains('button', 'Comenzar encuesta').click()

    // Wait for submission to start
    cy.wait('@startSubmission')

    // Check question is visible and fill answer
    cy.contains('¿Cuál es tu nombre?').should('be.visible')
    cy.get('input[id="shortText-101"]').type('Juan Perez')

    // Click submit
    cy.get('button#submitAnswersBtn').click()

    // Wait for API calls to save answers and submit the form
    cy.wait('@saveAnswers')
    cy.wait('@submitForm')

    // Check success message
    cy.contains('¡Respuestas enviadas!').should('be.visible')
  })
})
