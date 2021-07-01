---
title: "Kubernetes 의 Ephemeral Storage 리소스 이해하기"
date: 2021-06-29T19:30:48+09:00
draft: true
tags: [kubernetes]
---

## Intro
Kubernetes 는 실행 중인 컨테이너에서 사용할 리소스의 양을 지정할 수 있는 기능을 지원합니다.  
리소스는 Pod 스펙 중 `spec.containers[].resources.reequests` 혹은 `spec.containers[].resources.limits` 로 지정이 가능합니다.

컨테이너에 대한 리소스 요청 (request) 을 지정하면 스케줄러가 이 리소를 보고 해당 Pod 이 배치될 노드를 결정하며, 
컨테이너에 대한 리소스 제한 (limit) 을 지정하면 실행 중인 컨테이너가 이 제한보다 많은 리소스를 사용할 수 없도록 제한하게 됩니다.
이 리소스 제한을 넘어가게 되면, Pod 이 Evict 되고 다른 노드로 넘어가는 등 운영 중에 생각지 못한 일이 발생할 수 있습니다. 

리소스는 다음과 같이 여러 타입이 있습니다.
- cpu
- memory
- ephemeral-storage

위와 같은 리소스 외에도, 어드민이 확장 리소스를 정의하여 사용할 수 도 있습니다.

cpu 나 memory 의 경우 의미하는 바가 명확해 보이지만, `ephemeral-storage` 는 조금 생소해 보입니다.  
이름만으로 유추해 보자면, ephemeral 은 '임시' 라는 뜻을 가지고 있으므로, 임시 저장소 정도의 느낌이 될것 같은데,   
컨테이너 환경에서는 볼륨을 마운트 하지 않는 이상 데이터가 휘발성이 되기 때문에 이 임시 스토리지라는 이름은 조금 모호하게 느껴집니다.  
특히 Kubernetes 환경으로 넘어가게 되면 Pod 내의 컨테이너리끼리 디렉토리를 공유하는 `Emptydir`, 컨테이너 생성 전 초기화 작업을 진행하는 `initContainers` 같은 스펙 등으로 임시 저장소로 쓸 수 있는 요소들이 많아져 더더욱 헷갈립니다. (저는 그랬습니다..)


## Container's ephemeral storage resources
먼저, 컨테이너에 국한해서 Ephemeral Storage, 즉 임시 저장소로 포함될 수 있는 것들에 대해서 체크해 볼까요?  

### rootfs
컨테이너는 이미지 레이어 위에서 휘발성으로 동작합니다.  
이 말은, 도커 이미지를 빌드할 때 명시되지 않은 디렉토리나 파일은 컨테이너가 내려가면 삭제된다는 뜻입니다.  
아무리 컨테이너 위에서 파일을 쓰고 디렉토리를 만들어도 컨테이너가 내려가는 즉시 없어지는 휘발성 데이터이죠.  

그럼 컨터이너에 접근하여 Write 되는 데이터들은 어디에 저장될까요?  
Docker [Storage Driver](https://docs.docker.com/storage/storagedriver/select-storage-driver/) 에 따라 저장되는 위치가 다르긴 하지만,  
분명 호스트 어딘가에 저장될 것이고 컨테이너가 내려가지 않고 데이터가 쌓이게 되면 호스트에 영향을 줄 것이 분명합니다. (filesystem full 등)

> Docker storage driver 는 이 포스트에서는 다루지 않습니다.

### container log
컨테이너 내에서 포그라운드로 실행되는 프로세스는 stdout 으로 로그들을 내보내고, 이 로그들은 보통 `docker logs` 커맨드로 확인 할 수 있습니다.
```sh
$ docker run -d --name hello hello-world
a77cb544c0867a4c9a36f9acb22abe64b3fd598579311a7516243962522e08da

$ docker logs hello
Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

container log 역시 호스트에 JSON 형태로 저장됩니다. 그리고 이 container log 가 많아지면 호스트에 영향을 줄 수 있습니다.  
따라서 `container log` 역시 임시 저장소, `Ephemeral Storage` 에 포함됩니다.


## Kubernetes's ephemeral storage resources
`rootfs`, `container log` 두개로만 합산하여 Ephemeral Storage 사용량을 계산하면 참 간단하겠지만, Kubernetes 환경은 생각보다 만만치 않습니다. (?)  
Ephemeral Storage 리소스에 제한을 두는 것은, 노드에 뜨는 컨테이너에 의해 노드의 로컬 스토리지 가용량을 제어하려 하는 이유이고,  
Kubernetes 에서는 Pod 에서 호스트의 로컬 스토리지를 사용할 수 있는 방법을 제공하고 있기 때문입니다.  

### hostPath 
`hostPath` 볼륨은 `Docker` 에서 `--volume` 옵션을 사용하는 것처럼 호스트에 존재하는 파일 혹은 디렉토리를 Pod 에 마운트하여 사용하는 방식입니다.  
이 `hostPath` 볼륨은 클러스터 운용을 위한 어드민 데몬 외에 사용을 권장하고 있지 않습니다. 따라서 kube-system 혹은 다른 어드민 네임스페이스 외에는 보통 Pod Security Policy 를 통해 hostPath 볼륨의 사용을 제한합니다.  
실제로도 운영 환경에서 일반적인 어플리케이션을 배포할 때 `hostPath` 를 사용하는 케이스는 찾기가 쉽지 않죠.  
Kubernetes 에서도 이 `hostPath` 볼륨에 대해서는 따로 limit 을 걸고 있지 않습니다. 

### emptydir
Kubernetes 에서는 Pod 안에 있는 Container 끼리 특정 디렉토리로 데이터를 공유할 수 있는 `emptydir` 이라는 스펙을 지원합니다.  
`emptydir` 을 포함한 Pod 이 생성되면, Kubelet 은 호스트에 빈 디렉토리를 생성하여 Pod 에 마운트 해줍니다.  
Pod 이 내려가면 `emptydir` 내에 저장되어 있던 데이터도 사라지므로 임시 저장소라고 할 수 있습니다.  
다만, `hostPath` 볼륨과는 다르게 클러스터 어드민 외에도 흔하게 쓸 수 있는 리소스이기 때문에 제한을 두는 것이 좋아 보입니다.  

> 이 포스트에서는 `emptyDir.medium "Memory"` 은 고려하지 않습니다.

## How to calculate ephemeral storage?
위에서 우리는 Ephemeral Storage 에 포함될 수 있는 리소스들을 Container / Kubernetes 환경별로 살펴 보았습니다.  

정리해보면, 
- rootfs
- container log
- emptydir 

위 세개의 리소스가 `ephermeral storage` 의 사용량에 영향을 미친다는 것을 알 수 있습니다. 그렇다면 `Kubernetes` 에서는 위 세 개의 리소스를 가지고 어떻게 ephemeral storage 사용량을 계산하고 Pod 을 Evict 시킬까요? 

Kubernetes 소스에서 local storage 에 대한 eviction 을 체크하는 함수인 `localStorageEviction` 을 살펴봅시다.  
이 함수는 주기적으로 실행되며, 클러스터 내에서 Local Storage Limit 을 초과한 Pod 을 Eviction 시켜줍니다.  

```go
// localStorageEviction checks the EmptyDir volume usage for each pod and determine whether it exceeds the specified limit and needs
// to be evicted. It also checks every container in the pod, if the container overlay usage exceeds the limit, the pod will be evicted too.
func (m *managerImpl) localStorageEviction(pods []*v1.Pod, statsFunc statsFunc) []*v1.Pod {
	evicted := []*v1.Pod{}
	for _, pod := range pods {
		podStats, ok := statsFunc(pod)
		if !ok {
			continue
		}

		if m.emptyDirLimitEviction(podStats, pod) {
			evicted = append(evicted, pod)
			continue
		}

		if m.podEphemeralStorageLimitEviction(podStats, pod) {
			evicted = append(evicted, pod)
			continue
		}

		if m.containerEphemeralStorageLimitEviction(podStats, pod) {
			evicted = append(evicted, pod)
		}
	}

	return evicted
}

// https://github.com/kubernetes/kubernetes/blob/7d309e0104fedb57280b261e5677d919cb2a0e2d/pkg/kubelet/eviction/eviction_manager.go#L458
```

위 코드는 다음과 같이 동작합니다.
1. 인자로 넘어온 Pod 들을 순회하며
2. 현재 Pod 이 Evict 되어야 하는지 판단 후 Evict 시키고, 배열에 append
3. Append 된 Pod 배열을 리턴

현재 Pod 이 Evict 되어야 할지의 판단은 아래 세 종류로 판단합니다.
- `emptyDirLimitEviction`
- `podEphemeralStorageLimitEviction`
- `containerEphemeralStorageLimitEviction`

### emptyDirLimitEviction
이 함수는 `emptyDir` 의 사용량을 보고 Eviction 여부를 판단합니다.  
해당 Pod 이 `emptyDir` 이 있는지 체크하고, 있다면 현재 사용량과 Limit 을 비교합니다.  

먼저 `emptydir` 은 `sizeLimit` 이라는 스펙을 가질 수 있는데요,  
다음과 같이 사용됩니다.  
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test
spec:
  containers:
    - name: nginx
      image: nginx
      volumeMounts:
        - name: emptydir
          mountPath: "/emptydir"
  restartPolicy: Never
  volumes:
    - name: test
      emptyDir:
        sizeLimit: "1Gi"
```

여기서 명시된 `sizeLimit` 을 Limit 으로 두고 사용량을 검사하게 됩니다.  

만약 sizeLimit 을 명시하지 않는다면, 네임스페이스의 ephemeral storage quota 에 합산되어 
이 수치를 넘어서면 Pod 이 Evict 됩니다. 

> 앞서 주석으로 언급되었든 Memory 타입으로 사용되게 되면, memory quota 로 합산됩니다. 

### podEphemeralStorageLimitEviction
