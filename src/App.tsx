import cards from './cards.json'
import { useState, type ChangeEvent } from 'react'
import { jsPDF } from "jspdf";
// @ts-expect-error
import "@fontsource/faculty-glyphic"
import searchIcon from './searchicon.svg'


export default function App() {
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [selectedNames, setSelectedNames] = useState<string[]>([])
  const [printing, setPrinting] = useState(false)
  const [selectText, setSelectText] = useState('');
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
    const lowerName = name.toLowerCase()
    const card = cards.find(card => {
      const lowerCardName = card.name.toLowerCase()
      return lowerCardName === lowerName
    })
    if (!card) {
      return
    }
    function handleUnselect() {
      const lowerName = name.toLowerCase()
      const newSelectedNames = selectedNames.filter(selectedName => {
        const lowerSelectedName = selectedName.toLowerCase()
        return lowerSelectedName !== lowerName
      })
      console.log('newSelectedNames', newSelectedNames)
      setSelectedNames(newSelectedNames)
    }
    return (
      <div key={card.name} style={{ position: 'relative' }}>
        <div>
          <img src={card.image} />
        </div>
        <button onClick={handleUnselect} style={{ position: 'absolute', top: 10, right: 10 }}>-</button>
      </div>
    )
  })
  const items = filtered.map(card => {
    function handleSelect() {
      const newSelectedNames = [...selectedNames, card.name]
      setSelectedNames(newSelectedNames)
    }
    function handleUnselect() {
      const newSelectedNames = selectedNames.filter(selectedName => selectedName !== card.name)
      console.log('newSelectedNames', newSelectedNames)
      setSelectedNames(newSelectedNames)
    }
    const selected = selectedNames.includes(card.name)
    return (
      <div key={card.name} style={{ position: 'relative', maxWidth: '300px', width: '20%' }}>
        <div>
          <img src={card.image} style={{ width: '100%', height: 'auto' }} />
        </div>
        {selected
          ? <button style={{ position: 'absolute', top: 10, right: 10 }} onClick={handleUnselect}>-</button>
          : <button style={{ position: 'absolute', top: 10, right: 10 }} onClick={handleSelect}>+</button>}
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
      if (tags.includes('All cards')) {
        const newTags = tags.filter(tag => tag !== 'All cards');
        setTags(newTags);
      } else {
        setTags(['All cards']);
      }
      return
    }
    const withoutAll = tags.filter(tag => tag !== 'All cards');
    if (tags.includes(value)) {
      const filtered = withoutAll.filter(option => option !== value)
      setTags(filtered);
    } else {
      const added = [...withoutAll, value]
      setTags(added);
    }
  };
  return (
    <>
      <img
        style={{ width: '100%', marginTop: '90px' }}
        src='https://i.postimg.cc/5yKjK8dm/cbc6aa27699d36424fcccfe2ec250bd620e1534e.webp'
      />
      <div
        style={{
          alignItems: 'center',
          background: '#081e29',
          gap: '10px',
          display: 'flex',
          justifyContent: 'center',
          left: 0,
          padding: '10px',
          position: 'fixed',
          top: 0,
          width: 'calc(100% - 20px)',
          zIndex: '1'
        }}
      >
        <img
          height={50}
          src={searchIcon}
          width={50}
        />
        <input
          placeholder='Search'
          value={query}
          onChange={event => setQuery(event.target.value)}
          style={{
            background: 'transparent',
            color: 'white',
            border: 0,
            width: '100%',
            fontSize: '32px',
            fontFamily: 'Faculty Glyphic'
          }}
        />
        <select
          value={tags}
          onChange={handleTagSelect}
          multiple
          style={{ minWidth: '100px' }}
        >
          <option value='All cards'>All cards</option>
          {tagOptions}
        </select>
      </div>
      <div style={{ padding: '10px', fontFamily: 'Faculty Glyphic' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <textarea
            value={selectText}
            placeholder='Import cards (will delete selection)'
            onChange={event => {
              setSelectText(event.target.value)
              setSelectedNames(event.target.value.split('\n'))
            }}
            rows={5}
            style={{ marginBottom: '20px' }}
          />
          {selectedNames.length > 0 && (
            <>
              <h2>Selected ({selectedNames.length})</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
                {selectedItems}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '50px' }}>
                <div>
                  <button onClick={handleCopy}>Copy to Clipboard</button>
                </div>
                <div>
                  <button disabled={printing} onClick={handlePrint}>{printing ? 'Printing...' : 'Print'}</button>
                </div>
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {items}
        </div>
      </div>
    </>
  )
}