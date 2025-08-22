import cards from './cards.json'
import { useState } from 'react'

export default function App () {
  const [query, setQuery] = useState('')
  const lowerQuery = query.toLowerCase()
  const filtered = cards.filter(card => {
    const lowerDesignation = card.designation.toLowerCase()
    const designated = lowerDesignation.includes(lowerQuery)
    if (designated) return true
    const lowerName = card.name.toLowerCase()
    const named = lowerName.includes(lowerQuery)
    if (named) return true
    const lowerUpright = card.upright.toLowerCase()
    const uprighted = lowerUpright.includes(lowerQuery)
    if (uprighted) return true
    const lowerReverse = card.reversed.toLowerCase()
    const reversed = lowerReverse.includes(lowerQuery)
    if (reversed) return true
    const lowerTags = card.tags.map(tag => tag.toLowerCase())
    return lowerTags.some(tag => tag.includes(lowerQuery))
  })
  const rows = filtered.map(card => {
    return (
      <tr>
        <td>{card.designation}</td>
        <td>{card.name}</td>
        <td>{card.upright}</td>
        <td>{card.reversed}</td>
        <td>{card.tags.join(', ')}</td>
      </tr>
    )
  })
  return (
    <>
      <h1>Tarotarot</h1>
      <input
        placeholder='search'
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <table>
        <thead>
          <tr>
            <td>Designation</td>
            <td>Name</td>
            <td>Upright</td>
            <td>Reversed</td>
            <td>Tags</td>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </>
  )
}