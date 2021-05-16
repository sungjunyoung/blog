---
title: "Goroutine 은 어떻게 동작할까?"
date: 2021-05-17T00:45:48+09:00
draft: true
tags: [golang]
---

> 본 포스트는 GopherCon 2018 Kavya Joshi 의 [The Scheduler Saga](https://youtu.be/YHRO5WQGh0k) 발표를 재구성하여 작성하였습니다.  

## Intro
Golang 의 장점으로 빠짐없이 언급되는 것이 바로 강력한 동시성 지원입니다. 
이 강력한 동시성에서 빠질 수 없는 요소가 바로 Goroutine 입니다. 
개발자는 `go` 키워드를 통해 Goroutine 을 생성함으로서 손쉽게 동시성을 지원하는 프로그램을 개발할 수 있습니다. 
Channel 을 사용하면 Goroutine 간에 데이터를 손쉽게 전달할 수 도 있죠. 

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    go f()

    fmt.Println("hello world")
    time.Sleep(10 * time.Second)
}

func f() {
    for i := 0; i < 5; i++ {
        fmt.Printf("count: %d\n", i)
        time.Sleep(1 * time.Second)
    }
}
// hello world
// count: 0
// count: 1
// count: 2
// count: 3
// count: 4
```

얼핏 보면 Goroutine 은 다른 프로그래밍 언어에서 사용되는 Thread 와 같다고 생각할 수 있습니다.
하지만, [A Tour of Go](https://tour.golang.org/concurrency/1) 에서는 Goroutine 을 아래와 같이 정의하고 있습니다.

> "lightweight thread managed by the Go runtime" 

직역해보면 Go runtime 에 의해 관리되는 경량화된 스레드인데, 왠지 Thread 와는 다른 듯한 뉘앙스를 풍깁니다. 
Goroutine 은 무엇이고, 어떻게 동작하는지 한번 알아보겠습니다.

## Goroutine


## Runtime Scheduler