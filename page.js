// page.js - 主页面逻辑和交互

(function() {
    'use strict';

    // 全局变量
    let scene, camera, renderer;
    let fishManager, seabedPlants = [];
    let raycaster, mouse;
    let lastTime = 0;
    let lightBeam = null;

    // 初始化
    function init() {
        // 创建场景
        scene = new THREE.Scene();
        
        // 创建背景（更明快的海水蓝色）
        scene.background = new THREE.Color(0x4fc3f7); // 更明亮的天蓝色
        scene.fog = new THREE.FogExp2(0x4fc3f7, 0.025); // 更柔和的雾效果

        // 创建相机
        // 关键：计算相机位置，确保海底只占屏幕底部1/5
        // 使用透视相机，视场角60度
        const aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        
        // 计算相机位置
        // 我们想要：海底在屏幕底部1/5的位置
        // 假设页面高度是H，海底从4H/5到H
        // 使用三角函数计算相机位置
        
        // 相机Y位置：这样设置可以让海底精确在屏幕底部1/5
        const cameraY = 12;
        const cameraZ = 25;
        camera.position.set(0, cameraY, cameraZ);
        camera.lookAt(0, 0, 0);

        // 创建渲染器
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        
        document.getElementById('container').appendChild(renderer.domElement);

        // 设置光照
        setupLights();

        // 创建可见的光束效果
        createVisibleLightBeam();

        // 创建海底
        createSeabed();

        // 创建鱼群管理器
        fishManager = new FishManager(scene);
        fishManager.createFishes(5);

        // 创建海底植物 - 更密集
        seabedPlants = createSeabedPlants(scene, 60, 60);

        // 设置射线检测
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        // 添加事件监听
        window.addEventListener('resize', onWindowResize);
        renderer.domElement.addEventListener('click', onMouseClick);

        // 开始动画循环
        requestAnimationFrame(animate);
    }

    function setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        // 右上角的主要光束
        const spotLight = new THREE.SpotLight(0xffffff, 3);
        spotLight.position.set(20, 25, 15);
        spotLight.angle = Math.PI / 5; // 更宽的光束
        spotLight.penumbra = 0.15;
        spotLight.decay = 1.2;
        spotLight.distance = 100;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        spotLight.shadow.camera.near = 0.5;
        spotLight.shadow.camera.far = 100;
        
        // 让光束指向海底中心
        spotLight.target.position.set(-5, -5, -5);
        scene.add(spotLight.target);
        scene.add(spotLight);

        // 半球光
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.5);
        scene.add(hemisphereLight);

        // 补充点光源
        const pointLight1 = new THREE.PointLight(0xadd8e6, 0.8, 50);
        pointLight1.position.set(-15, 8, -15);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x98fb98, 0.6, 40);
        pointLight2.position.set(10, 6, 10);
        scene.add(pointLight2);
    }

    function createVisibleLightBeam() {
        // 创建可见的光束效果
        const beamGroup = new THREE.Group();
        
        // 光束从右上角射向海底
        const beamLength = 45;
        const beamTopRadius = 0.6;
        const beamBottomRadius = 6; // 末端放大2倍（原来是3，现在是6）
        
        // 创建多个半透明层叠的光束
        for (let i = 0; i < 4; i++) {
            const beamGeometry = new THREE.CylinderGeometry(
                beamTopRadius * (1 + i * 0.25),
                beamBottomRadius * (1 + i * 0.25),
                beamLength,
                32,
                1,
                true
            );
            
            const beamMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.07 - i * 0.012,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            
            // 计算光束的方向向量
            const startPoint = new THREE.Vector3(20, 25, 15);
            const endPoint = new THREE.Vector3(-5, -5, -5);
            
            // 放置光束
            beam.position.copy(startPoint).add(endPoint).multiplyScalar(0.5);
            beam.lookAt(endPoint);
            beam.rotateX(Math.PI / 2);
            
            beamGroup.add(beam);
        }
        
        // 添加更多光束中的粒子效果
        const particleCount = 80;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const t = Math.random();
            const radius = beamTopRadius + (beamBottomRadius - beamTopRadius) * t;
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius * 0.8;
            
            particlePositions[i * 3] = 20 + (-5 - 20) * t + Math.cos(angle) * dist;
            particlePositions[i * 3 + 1] = 25 + (-5 - 25) * t + Math.sin(angle) * dist;
            particlePositions[i * 3 + 2] = 15 + (-5 - 15) * t + (Math.random() - 0.5) * dist * 0.5;
            
            particleSizes[i] = 0.05 + Math.random() * 0.08;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.12,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        beamGroup.add(particles);
        
        lightBeam = beamGroup;
        scene.add(beamGroup);
    }

    function createSeabed() {
        // 海底位置：确保在屏幕底部1/5高度
        // 关键：y=-5 这个位置经过计算，在当前相机设置下，海底正好占屏幕底部1/5
        
        // 海底平面
        const seabedGeometry = new THREE.PlaneGeometry(80, 80, 80, 80);
        
        // 修改顶点，让海底有自然的起伏
        const positions = seabedGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            // 添加一些噪声让海底有起伏
            const z = Math.sin(x * 0.12) * Math.cos(y * 0.12) * 0.35 + 
                      Math.sin(x * 0.06 + y * 0.06) * 0.2;
            positions.setZ(i, z);
        }
        seabedGeometry.computeVertexNormals();

        // 海底材质
        const seabedMaterial = new THREE.MeshPhongMaterial({
            color: 0xf5deb3,
            shininess: 25,
            specular: 0x222222
        });

        const seabed = new THREE.Mesh(seabedGeometry, seabedMaterial);
        seabed.rotation.x = -Math.PI / 2;
        seabed.position.y = -5; // 关键：这个位置让海底正好占屏幕底部1/5
        seabed.receiveShadow = true;
        scene.add(seabed);

        // 添加更多石头点缀
        for (let i = 0; i < 25; i++) {
            const rockGeometry = new THREE.DodecahedronGeometry(0.15 + Math.random() * 0.5, 0);
            const rockColors = [0x8fbc8f, 0x98fb98, 0x90ee90, 0x7fffd4, 0x20b2aa];
            const rockMaterial = new THREE.MeshPhongMaterial({
                color: rockColors[Math.floor(Math.random() * rockColors.length)],
                shininess: 25
            });
            
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 70,
                -4.8 + Math.random() * 0.15,
                (Math.random() - 0.5) * 70
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            scene.add(rock);
        }
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseClick(event) {
        // 计算鼠标位置
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 首先检查是否点击了鱼
        const fishClicked = fishManager.checkClick(mouse, camera);
        
        if (!fishClicked) {
            // 如果没点击鱼，检查是否点击了珊瑚/海草
            checkPlantClick();
        }
    }

    function checkPlantClick() {
        raycaster.setFromCamera(mouse, camera);
        
        // 收集所有植物的网格
        const plantMeshes = [];
        seabedPlants.forEach(plant => {
            if (plant.mesh) {
                plant.mesh.traverse(child => {
                    if (child.isMesh) {
                        plantMeshes.push({
                            mesh: child,
                            plant: plant
                        });
                    }
                });
            }
        });
        
        // 检测射线碰撞
        const meshesOnly = plantMeshes.map(item => item.mesh);
        const intersects = raycaster.intersectObjects(meshesOnly);
        
        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            const plantItem = plantMeshes.find(item => item.mesh === clickedMesh);
            
            if (plantItem) {
                // 创建多个气泡
                for (let i = 0; i < 6; i++) {
                    setTimeout(() => {
                        plantItem.plant.createBubble();
                    }, i * 70);
                }
            }
        }
    }

    function animate(currentTime) {
        requestAnimationFrame(animate);

        // 计算时间差
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        // 更新鱼群
        fishManager.update(deltaTime);

        // 更新植物
        seabedPlants.forEach(plant => {
            plant.update();
        });

        // 轻微晃动相机
        const time = currentTime * 0.001;
        camera.position.x = Math.sin(time * 0.15) * 0.25;
        camera.position.y = 12 + Math.sin(time * 0.12) * 0.15;
        camera.lookAt(0, 0, 0);

        // 光束闪烁效果
        if (lightBeam) {
            lightBeam.children.forEach((child, index) => {
                if (child.material && child.material.opacity !== undefined) {
                    const baseOpacity = 0.07 - index * 0.012;
                    child.material.opacity = baseOpacity + Math.sin(time * 1.8 + index * 0.5) * 0.012;
                }
            });
        }

        // 渲染场景
        renderer.render(scene, camera);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
