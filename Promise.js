const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

const promiseResolve = (promise,x,resolve,reject) => {
	if(promise === x){
		reject(throw new TypeError("Chaining cycle detected for promise #<Promise>"))
	}
	let called;
	if((typeof x === 'object' && x !== null) || typeof x === 'function'){
		try{
			let then = x.then;
			if(typeof then === 'function'){
				then.call(x,(y)=>{
					if(!called) return;
					called = true;
					promiseResolve(promise,y,resolve,reject)
				},(r)=>{
					if(!called) return;
					called = true;
					reject(r);
				})
			}else{
				resolve(x);
			}
		}catch (e) {
			if(!called) return;
			called = true;
			reject(e);
		}
	}else{
		resolve(x);
	}
};

class Promise {
	constructor(executor) {
		this.value = undefined;
		this.reason = undefined;
		this.state = PENDING;
		this.onFulfilledArray = [];
		this.onRejectArray = [];
		
		const resolve = (value) => {
			if(this.state === PENDING){
				this.state = FULFILLED;
				this.value = value;
				this.onFulfilledArray.forEach(fn => fn());
			}
		};
		
		const reject = (reason) => {
			if(this.state === PENDING){
				this.state = REJECTED;
				this.reason = reason;
				this.onRejectArray.forEach(fn => fn());
			}
		};
		
		try{
			executor(resolve,reject);
		}catch (e) {
			reject(e);
		}
	}
	then(onFulfilled,onReject){
		onFulfilled = typeof onFulfilled === 'function'?onFulfilled:data=>data;
		onReject = typeof onReject === 'function'?onReject:err=>{throw err};
		let p2 = new Promise((resolve,reject)=>{
			if(this.state === FULFILLED){
				setTimeout(()=>{
					try {
						let x = onFulfilled(this.value);
						promiseResolve(p2,x,resolve,reject);
					}catch (e) {
						reject(e)
					}
				})
			}
			
			if(this.state === REJECTED){
				setTimeout(()=>{
					try {
						let x = onReject(this.reason);
						promiseResolve(p2,x,resolve,reject);
					}catch (e) {
						reject(e);
					}
				})
			}
			
			if(this.state === PENDING){
				this.onFulfilledArray.push(()=>{
					setTimeout(()=>{
						try {
							let x = onFulfilled(this.value);
							promiseResolve(p2,x,resolve,reject);
						}catch (e) {
							reject(e)
						}
					})
				});
				this.onRejectArray.push(()=>{
					setTimeout(()=>{
						try {
							let x = onReject(this.reason);
							promiseResolve(p2,x,resolve,reject);
						}catch (e) {
							reject(e);
						}
					})
				})
			}
		});
		return p2;
	}
}

module.exports = Promise;
