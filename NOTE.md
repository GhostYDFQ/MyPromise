# promise A+规范
## 1.Terminology
- 1.1 promise是一个具有then方法的对象或者函数，其行为符合此规范。
- 1.2 thenable是定义then方法的对象或函数。
- 1.3 value是一个任何合法的JavaScript值（包括未定义，thenable 或者promise）。
- 1.4 exception是一个抛出异常的值。
- 1.5 reason是一个失败原因的值。

## 2.Requirements
### 2.1 Promise States
一个promise必须有三个状态：等待态、成功态、失败态
- 2.1.1 如果是等待态的情况下：
  - 2.1.1.1 他可以转化成其他的成功或者失败的状态。
- 2.1.2 如果一个promise是成功态的时候：
  - 2.1.2.1 他不能转化成任何状态。
  - 2.1.2.2 他应该有一个值，这个值不能被更改。
- 2.1.3 如果是失败态的话：
  - 2.1.3.1 他不能转化成任何状态。
  - 2.1.3.2 他必须有一个原因也不能被更改。 
   
这里的不能更改指的是引用地址的不变，不意味深度不变。

### 2.2 The then Method
一个promise必须提供一个then方法来访问最终成功的值或者失败的原因。
then方法接受两个参数
```
promise.then(onFulfilled, onRejected)
```
- 2.2.1 onFulfilled, onRejected这两个方法都是可选的。
  - 2.2.1.1 如果onFulfilled不是一个函数就忽略它。
  - 2.2.1.2 如果onRejected不是一个函数就忽略它。
- 2.2.2 如果onFulfilled是一个函数
  - 2.2.2.1 必须在promise成功后调用它，第一个参数是promise的成功的值。
  - 2.2.2.2 不能在成功之前调用它
  - 2.2.2.3 不能多次调用它。
- 2.2.3 如果onRejected是一个函数。
  - 2.2.3.1 必须在promise失败后调用它，第一个参数是promise的失败原因。
  - 2.2.3.2 不能再promise失败之前调用它
  - 2.2.3.3 不能多次调用它。
- 2.2.4 onFulfilled或者onRejected不能被在当前执行上下文中调用，你可以在其他平台中执行代码（3.1）
- 2.2.5 onFulfilled和onRejected必须作为函数调用（3.2）
- 2.2.6 then可能在同一个promise中被多次调用
  - 2.2.6.1 在promise成功的时候，所有的各自onFulfilled的回调都必须按照对他们原始调用的顺序执行。 
  - 2.2.6.2 在promise失败的时候，所有的各自onRejected的回调都必须按照对他们原始调用的顺序执行。 
- 2.2.7 then必须返回一个promise
```
promise2 = promise1.then(onFulfilled,onRejected)
```
   - 2.2.7.1 如果onFulfilled或者onRejected返回一个值叫x，应该执行一个promise的处理函数 
   ```
    [[Resolve]](promise2,x)
   ```
   - 2.2.7.2 在执行onFulfilled或者onRejected的时候有可能抛出一个错误e，promise2要变成拒绝状态，而且要把e作为失败的原因。
   - 2.2.7.3 如果onFulfilled不是函数并且promise1已经是成功态的，那么promise2必须要使用promise1的值作为成功的态的值。
   - 2.2.7.4 如果onReject不是函数并且promise1已经是失败态的，那么promise2必须要使用使用promise1的原因作为失败态的原因
   
    
### 2.3 这个promise处理函数  
去执行这个
```
[[Resolve]](promise,x)
```
根据平台依次执行。
- 2.3.1 如果promise和x引用了同一个对象，那就让Promise失败，并且抛出一个TypeError作为这个promise的失败原因
- 2.3.2 如果这个x是一个promise的话，那就采用它的状态。
  - 2.3.2.1 如果x是等待态，则Promise就要保持等待处理，直到x被实现或拒绝为止。
  -
- 2.3.3 如果x是一个对象或者函数。
  - 2.3.3.1 定义then为x.then
  - 2.3.3.2 如果我们去取x.then，它也可能会抛出一个异常e，那么就使用e作为这个promise的失败的原因。
  - 2.3.3.3 如果then是一个方法，那就调用它，并且让x作为他的this，第一个参数是resolvePromise第二个参数是rejectPromise
    - 2.3.3.3.1 成功的resolvePromise它的值是y,执行（[[Resolve]](promise,y)）
    - 2.3.3.3.2 失败的rejectpromise它的原因是r,调用promise的reject值是r
    - 2.3.3.3.3 成功的resolvePromise和失败的rejectpromise都被调用，或者都被调用多次，只处理第一次的，其他的都会被忽略。
    - 2.3.3.3.4 如果调用后抛出异常e
      - 2.3.3.4.1 如果已经调用了resolvePromise或者rejectpromise，就忽略它
      - 2.3.3.4.2 否则就用e作为拒绝的原因。
  - 2.3.3.4 如果then不是一个函数，那就用x让promise成功
- 2.3.4 如果x不是一个对象或者函数，就让x作为promise成功的值就可以了。

### 3.Notes
- 3.1 这里的平台代码指引擎，实际上，此要求可确保在调用之后的事件循环之后，使用新堆栈异步执行onFulfilled和onRejected。可以使用“宏任务机制”（setTimeout或setImmediate）
       或微任务机制（MutationObserver或process.nextTic）来实现。
- 3.2 在严格模式下，这在他们内部是不确定的，在普通模式下，他将是全局对象。      
- 3.3 如果实现满足所有要求，则实现可以允许promise2 === promise1。 每个实现都应记录是否可以产生promise2 === promise1以及在什么条件下产生。
- 3.4 通常，只有x来自当前的实现，才知道它是一个真正的承诺。 本节允许使用特定于实现的方式来采用已知符合承诺的状态。
- 3.5 首先存储对x.then的引用，然后测试该引用，然后调用该引用的过程避免了对x.then属性的多次访问。 此类预防措施对于确保访问者属性的一致性非常重要，因为访问者属性的值可能在两次检索之间发生变化。
- 3.6 实现不应在可建立链的深度上设置任意限制，并假定超出该任意限制，则递归将是无限的。 只有真正的循环才应该导致TypeError； 如果遇到无限多个不同的罐头，则永远递归是正确的行为。
```
// 1
let p = new Promise((resolve, reject)=>{
	setTimeout(()=>{
		resolve("成功")
	},1000)
});
p.then(data=>console.log(data),err=>console.log(err));

// 2
let p = new Promise((resolve, reject)=>{
	setTimeout(()=>{
		resolve("成功")
	},1000)
}).then(data=>console.log(data),err=>console.log(err));

这两种写法是不一样的，一个是第一个then的返回值，一个是第二个then的返回值。
如果catch之前有错误的捕获，那么catch不会执行。

promise的返回值时一个普通值或者返回的是一个成功态的promise，那么会走then的成功的方法。
如果返回的是一个失败态的promise或者抛出一个异常，那么会走then的失败的方法。
```  
  


