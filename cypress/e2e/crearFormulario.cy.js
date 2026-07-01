describe('Crear formulario', () => {
  let createdForm = null

  beforeEach(() => {
    cy.viewport(1440, 1200)
    createdForm = null

    cy.intercept('GET', '**/api/auth/me', {
      statusCode: 200,
      body: {
        user: {
          id: 1,
          email: 'admin@nur.edu.bo',
          full_name: 'Administrador NUR',
          role: 'admin'
        }
      }
    }).as('me')

    cy.intercept('GET', '**/api/campaigns/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Campaña de prueba',
        description: 'Campaña para validar el flujo de formularios',
        status: 'draft',
        members: []
      }
    }).as('getCampaign')

   
cy.intercept('GET', '**/api/forms/campaign/1', (req) => {
      req.reply({
        statusCode: 200,
        body: createdForm ? [createdForm] : []
      })
    }).as('getForms')


    cy.visit('http://localhost:5173/campaigns/1', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'fake-token')
      }
    })

    
    cy.wait('@me')
    cy.wait('@getCampaign')
    cy.wait('@getForms')
  })

  it('debe crear un formulario desde la vista de campaña', () => {
    cy.intercept('POST', '**/api/forms', (req) => {
      expect(req.body.title).to.eq('Encuesta de prueba')

      createdForm = {
        id: 42,
        title: 'Encuesta de prueba',
        description: '',
        campaign_id: 1,
        access_type: 'public',
        status: 'draft'
      }

      req.reply({
        statusCode: 201,
        body: createdForm
      })
    }).as('createForm')

   
        // Abrir modal
      cy.contains('button', 'Nuevo formulario')
        .should('be.visible')
        .click()

      // Verificar modal
      cy.contains('Nuevo formulario')
        .should('be.visible')

      // Escribir título
      cy.get('input[placeholder="Encuesta de satisfacción"]')
        .should('be.visible')
        .type('Encuesta de prueba')

      // Enviar el formulario desde el botón del modal
      cy.contains('.modal__footer button', 'Crear formulario')
        .should('be.visible')
        .click()

      cy.wait('@createForm')
        .its('response.statusCode')
        .should('eq', 201)

  
    cy.contains('Encuesta de prueba', { timeout: 10000 })
      .should('exist')
  })
})