const button=document.getElementById('btn');
    const body=document.querySelector('body');
     button.addEventListener('click',()=>{
      button.classList.add('addButton');
      body.classList.add('addBody')
      window.print();
      button.classList.add('addButton1');
      body.classList.add('addBody1');
    })