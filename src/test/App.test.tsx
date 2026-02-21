import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { useAuthStore } from '../store/authStore'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({
      pat: null,
      username: null,
      avatarUrl: null,
      isAuthenticated: false,
      isValidating: false,
      error: null,
    })
  })

  it('shows PatForm when not authenticated', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/Personal Access Token/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/ghp_/i)).toBeInTheDocument()
  })

  it('shows RepoSelector when authenticated but no repo configured', () => {
    useAuthStore.setState({
      pat: 'ghp_test',
      username: 'testuser',
      avatarUrl: '',
      isAuthenticated: true,
    })

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Vault 레포 설정')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('owner')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('repo')).toBeInTheDocument()
  })
})
