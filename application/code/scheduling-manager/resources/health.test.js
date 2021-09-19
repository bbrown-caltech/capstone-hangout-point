const app = require('../test-server')
const supertest = require('supertest')
const request = supertest(app)

it('Gets the Health Status', async () => {
    const response = await request.get('/healthz')
    
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Service is alive...')
    
})
