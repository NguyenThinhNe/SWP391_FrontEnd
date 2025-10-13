export default function Dashboard(){
  return (
    <div>
      <h2>Hello, Jso!</h2>
      <p>An overview of your works.</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{padding:16,background:'#fff',borderRadius:8,boxShadow:'0 0 0 1px #eee inset'}}>Assigned Orders<br/><strong>12</strong></div>
        <div style={{padding:16,background:'#fff',borderRadius:8,boxShadow:'0 0 0 1px #eee inset'}}>Completed Orders<br/><strong>04</strong></div>
      </div>
    </div>
  )
}
