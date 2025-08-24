import cards from './cards.json'
import { useState } from 'react'

export default function App() {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')
  const [selectedNames, setSelectedNames] = useState<string[]>([])
  const tags = cards.flatMap(card => card.tags)
  const tagSet = new Set(tags)
  const uniqueTags = Array.from(tagSet).sort()
  const tagOptions = uniqueTags.map(tag => {
    return (
      <option key={tag} value={tag}>{tag}</option>
    )
  })
  const lowerQuery = query.toLowerCase()
  const filtered = cards.filter(card => {
    const lowerTags = card.tags.map(tag => tag.toLowerCase())
    if (tag !== '') {
      const lowerTag = tag.toLowerCase()
      const tagged = lowerTags.includes(lowerTag)
      if (!tagged) return false
    }
    if (query === '') {
      return true
    }
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
    return lowerTags.some(tag => tag.includes(lowerQuery))
  })
  const rows = filtered.map(card => {
    function handleSelect() {
      const newSelectedNames = [...selectedNames, card.name]
      setSelectedNames(newSelectedNames)
    }
    const selected = selectedNames.includes(card.name)
    const key = `${card.name}-all`
    return (
      <tr key={key}>
        <td>{card.designation}</td>
        <td>{card.name}</td>
        <td>{card.upright}</td>
        <td>{card.reversed}</td>
        <td>{card.tags.join(', ')}</td>
        <td>
          <img src={card.image} />
        </td>
        <td>
          {!selected && (
            <button onClick={handleSelect}>Select</button>
          )}
        </td>
      </tr>
    )
  })
  const selectedRows = selectedNames.map((name) => {
    const card = cards.find(card => card.name === name)
    if (!card) {
      throw new Error(`Card ${name} not found`)
    }
    function handleUnselect() {
      const newSelectedNames = selectedNames.filter(selectedName => selectedName !== name)
      console.log('newSelectedNames', newSelectedNames)
      setSelectedNames(newSelectedNames)
    }
    const key = `${card.name}-selected`
    return (
      <tr key={key}>
        <td>{card.designation}</td>
        <td>{card.name}</td>
        <td>{card.upright}</td>
        <td>{card.reversed}</td>
        <td>{card.tags.join(', ')}</td>
        <td>
          <button onClick={handleUnselect}>Unselect</button>
        </td>
      </tr>
    )
  })
  const gridItems = filtered.map(card=> {
    function handleSelect() {
      const newSelectedNames = [...selectedNames, card.name]
      setSelectedNames(newSelectedNames)
    }
    const selected = selectedNames.includes(card.name)
    return (
      <div key={card.name}>
        <div>
          <img src={card.image} />
        </div>
        {!selected && <button onClick={handleSelect}>Select</button>}
      </div>
    )
  })
  return (
    <>
      <h1>Tarotarot</h1>
      {selectedNames.length > 0 && (
        <>
          <h2>Selected</h2>
          <table style={{ marginBottom: '50px' }}>
            <thead>
              <tr>
                <td>Designation</td>
                <td>Name</td>
                <td>Upright</td>
                <td>Reversed</td>
                <td>Tags</td>
                <td>Image</td>
                <td>Actions</td>
              </tr>
            </thead>
            <tbody>
              {selectedRows}
            </tbody>
          </table>
        </>
      )}
      <input
        placeholder='search'
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <select
        value={tag}
        onChange={event => setTag(event.target.value)}
      >
        <option value=''>All tags</option>
        {tagOptions}
      </select>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}> 
        {gridItems}
      </div>
      <table>
        <thead>
          <tr>
            <td>Designation</td>
            <td>Name</td>
            <td>Upright</td>
            <td>Reversed</td>
            <td>Tags</td>
            <td>Image</td>
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </>
  )
}