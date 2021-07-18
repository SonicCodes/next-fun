# NextFun
Inline Serverside functions for next.js page routes, what does that mean?

## Why?
I've been working on a project for a while now and I've found myself writing a lot of code in the api route. I wanted to make it easier to write and maintain mini server-side code.

## How?
1. Install
```bash
npm install -i @scaleai/next-fun
```
```bash
yarn add @scaleai/next-fun
```
2. Configure next-fun on your next.config.js file
```js
const {withNextFun} = require("@scaleai/next-fun");

module.exports = withNextFun({
    //other configs
})
```
3. Create a function on your page route, e.x
```javascript
async function $say_hi(){
    console.log("I'm on your server's console, yay!")
    return `Hie, say magic.`
}

export default function Home() {
    return <button onClick={async ()=>{
        alert(await $say_hi())
    }}>
    
    </button>
}
```

This is a normal function, it takes no arguments, returns a string. except it must be asynchronously called, should not get or set any state directly & the function name should be prefixed with $ (e.x $say_hi) as it's the only way next-fun could identify that it's a server-side function.

- - -
In three steps, you now have the ability to define server-side functions for your page routes.



## Example
### Blogs
```javascript
async function $like_post(post_id){
    // you have a req object, you can use it to get the cookies, session, etc.
    const fetch = require("node-fetch")
    const user = req.session.user_id
    const status = await (await fetch(`${process.env.base_cms_url}/action/like`, {
        method: "POST",
        body: JSON.stringify({ 
            post_id,
            user
        }),
        headers: {
            "Content-Type": "application/json",
        }
    }).json())
    return status.success === true
}

export default function Post() {
    return <div>
    <h1>Banana Mania</h1>
    <article>I love bananas, they are not the type of things I enjoy mostly, but still who gives a darn f##k.</article>
    <button onClick={async ()=>{
        if(await $like_post("banana-mania")){
            alert("You like bananas!")
        }else{
            alert("Something went wrong!")
        }
    }}>Like</button>
    </div>
}
```
Yay, we created a blog operation without an api route & it looks like a normal function.

### Newsletter subscription
```javascript
async function $subscribe(email){
    // you have a req object, you can use it to get the cookies, session, etc.
    try{
const {subscribtionModel} = require("/db/models")
    subscribtionModel.create({
        email,
    }).then(subscribtion => {
        return subscribtion.save()
    })  
    return true
    }catch(e){
return false;
    }
    
}

export default function Home() {
    return <div>
    <h1>Aloha, ?!</h1>
    <article>The worst website ever, but you might still want to be uptodate.</article>
    <section>
    <h3>Subscribe</h3>
    <input type="email" id="email_input" placeholder="email"/>
    <button onClick={async ()=>{
        if(await $subscribe(document.getElementById("email_input").value))){
            alert("We'll let you know of anything.")
        }else{
            alert("Something went wrong!")
        }
    }}>Subscribe</button>
    </section>
    
    </div>
}
```

### Security Concerns.
Thinks about this as normal api routes, except you can call it directly as a normal function.

As per that, there's not that much of securtity concern, but if you're using this in a production environment, you should make sure you have csrf tokens validation in place, I might make a default csrf validator for next-fun in the future, but for now, you need to do it yourself.

You should make sure you have all your api tokens in your environment file, so that you don't have to worry about them being leaked.

- Will my api tokens be exposed to the client? 
    - No, they are not exposed to the client, they are only exposed to the server, so you can't access them from the client, unless you returned the process.env.token from the server side function.
- Why is this better than api routes.
    - Writing too many api routes is just f***ed up, I for ex had around 100 api routes in my project, and I was getting tired of writing them (creating a new route for each api route was just too much).
- Why can't I access local variables of the client?
    - I've gone through this question & at basic it's not a good idea to mutate a state from the server side, it creates a wide open security hole, local variables are meant to be predictable, if you accessed a local variable from the server it might replace a value in the server's variables, i.e (process.env.base_url), now see what that creates.
- Can I use this in a production environment?
    - If you know what you're doing, yes you can.

### Faqs
- How does it work?
    - Next-Fun replaces any function in the /pages/...(.js|.jsx) route with a function of the same name & creates an api route in /api/execute/{file_name}_{function_name}_{level}.js, & it calls that as a normal fetch request, await it and return the response as either json or string.


## License
MIT
You can use this in any project, but you should keep the license & copyright. I'm not responsible for any damage caused by this.
