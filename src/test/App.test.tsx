import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { useAuthStore } from '../store/authStore'

describe('App', () => {
  beforeEach(() => {
    sessionStorage.clear()
    useAuthStore.setState({
      token: null,
      username: null,
      avatarUrl: null,
      isAuthenticated: false,
      isExchanging: false,
      error: null,
    })
  })

  it('shows OAuthLoginScreen when not authenticated', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Login with GitHub')).toBeInTheDocument()
  })

  it('shows RepoSelector when authenticated but no repo configured', () => {
    useAuthStore.setState({
      token: 'gho_test',
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
  })
})
