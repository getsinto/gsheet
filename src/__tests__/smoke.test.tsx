import { render, screen } from '@testing-library/react'
import React from 'react'

describe('smoke', () => {
  it('test runner works', () => {
    render(<div>ok</div>)
    expect(screen.getByText('ok')).toBeInTheDocument()
  })
})