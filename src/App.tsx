import cards from './cards.json'
import { useState, type ChangeEvent } from 'react'
import { jsPDF } from "jspdf";

export default function App() {
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [selectedNames, setSelectedNames] = useState<string[]>([])
  const [printing, setPrinting] = useState(false)
  const allTags = cards.flatMap(card => card.tags)
  const tagSet = new Set(allTags)
  const uniqueTags = Array.from(tagSet).sort()
  const tagOptions = uniqueTags.map(tag => {
    return (
      <option key={tag} value={tag}>{tag}</option>
    )
  })
  const lowerQuery = query.toLowerCase()
  const lowerTags = tags.map(tag => tag.toLowerCase())
  const filtered = cards.filter(card => {
    const lowerCardTags = card.tags.map(tag => tag.toLowerCase())
    if (tags.length > 0) {
      if (tags.includes('All cards')) {
        return true
      }
      const tagged = lowerTags.every(tag => lowerCardTags.includes(tag))
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
    return lowerCardTags.some(tag => tag.includes(lowerQuery))
  })
  const selectedItems = selectedNames.map((name) => {
    const card = cards.find(card => card.name === name)
    if (!card) {
      throw new Error(`Card ${name} not found`)
    }
    function handleUnselect() {
      const newSelectedNames = selectedNames.filter(selectedName => selectedName !== name)
      console.log('newSelectedNames', newSelectedNames)
      setSelectedNames(newSelectedNames)
    }
    return (
      <div key={card.name}>
        <div>{card.name}</div>
        <div>
          <img src={card.image} height={300} width={180} />
        </div>
        <button onClick={handleUnselect}>Unselect</button>
      </div>
    )
  })
  const items = filtered.map(card => {
    function handleSelect() {
      const newSelectedNames = [...selectedNames, card.name]
      setSelectedNames(newSelectedNames)
    }
    const selected = selectedNames.includes(card.name)
    return (
      <div key={card.name}>
        <div>{card.name}</div>
        <div>
          <img src={card.image} height={300} width={180} />
        </div>
        {!selected && <button onClick={handleSelect}>Select</button>}
      </div>
    )
  })
  function handleCopy() {
    console.log('selectedNames', selectedNames)
    const text = selectedNames.join('\n')
    console.log('text', text)
    window.navigator.clipboard.writeText(text)
  }
  async function urlToData(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise((resolve) => {
      reader.onloadend = () => {
        if (typeof reader.result !== 'string') {
          throw new Error('reader.result is not a string');
        }
        resolve(reader.result);
      };
    });
  }
  async function handlePrint() {
    setPrinting(true)
    const doc = new jsPDF();
    let index = 0
    for (const name of selectedNames) {
      if (index > 3) {
        doc.addPage()
        index = 0
      }
      console.log('name', name)
      const row = Math.floor(index / 2)
      const column = index % 2
      const x = 10 + column * 76
      console.log('x', x)
      const y = 10 + row * 127
      console.log('y', y)
      const card = cards.find(card => card.name === name)
      if (card == null) {
        throw new Error('card not found');
      }
      const data = await urlToData(card?.image)
      doc.addImage(data, 'PNG', x, y, 76, 127);
      index += 1
    }
    doc.save("a4.pdf");
    setPrinting(false)
  }
  function handleTagSelect(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    if (value === 'All cards') {
      setTags(['All cards'])
      return
    }
    setTags(prev =>
      prev.includes(value)
        ? prev.filter(option => option !== value)
        : [...prev, value]
    );
  };
  return (
    <>
      <h1>Tarotarot</h1>
      {selectedNames.length > 0 && (
        <>
          <h2>Selected ({selectedNames.length})</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
            {selectedItems}
          </div>
          <button style={{ marginBottom: '50px' }} onClick={handleCopy}>Copy to Clipboard</button>
          <button disabled={printing} onClick={handlePrint}>{printing ? 'Printing...' : 'Print'}</button>
        </>
      )}
      <h2>Search</h2>
      <input
        placeholder='filter'
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <select
        value={tags}
        onChange={handleTagSelect}
        multiple
      >
        <option value='All cards'>All cards</option>
        {tagOptions}
      </select>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {items}
      </div>
    </>
  )
}