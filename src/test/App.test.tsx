import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows PatForm when not authenticated', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/Personal Access Token/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/ghp_/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '연결' })).toBeInTheDocument()
  })
})
