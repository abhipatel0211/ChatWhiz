import React from 'react'

const Avtar = ({ userId, email }) => {
  // const colors = ['bg-red-200', 'bg-green-200', 'bg-purple-200', 'bg-blue-200', 'bg-yellow-200', 'bg-teal-200','bg-orange-200','bg-lime-200','bg-indigo-400','bg-fuchsia-400']
  // // const userIdBase10 = parseInt(userId, 16);
  // // console.log(userIdBase10 % colors.length);
  // const ans = Math.floor(Math.random() * 10);
  // // console.log("ans="+ans);
  // const color = colors[ans];
  const colors = ['bg-red-200', 'bg-green-200', 'bg-purple-200', 'bg-blue-200', 'bg-yellow-200', 'bg-teal-200', 'bg-orange-200', 'bg-lime-200', 'bg-indigo-400', 'bg-fuchsia-400'];
  const userIdBase10 = parseInt(userId, 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];
  return (
      <div className={'w-8 rounded-full h-8 flex items-center justify-center '+color}>
        <div className="text-center w-full opacity-70">{email[0]}</div>    
      
    </div>
  )
}

export default Avtar;