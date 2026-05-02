// grass.js - 珊瑚和海草相关代码

(function(global) {
    'use strict';

    // 珊瑚类
    class Coral {
        constructor(scene, position, type = 0) {
            this.scene = scene;
            this.position = position.clone();
            this.type = type;
            this.mesh = null;
            this.bubbles = [];
            this.createCoral();
        }

        createCoral() {
            // 根据类型创建不同形状的珊瑚
            const coralGroup = new THREE.Group();
            
            if (this.type === 0) {
                // 鹿角珊瑚 - 更明快的粉色
                const coralColor = 0xff69b4; // 热粉色
                this.createAntlerCoral(coralGroup, coralColor);
            } else if (this.type === 1) {
                // 脑珊瑚 - 青绿色
                const brainColor = 0x40e0d0; // 绿松石色
                this.createBrainCoral(coralGroup, brainColor);
            } else {
                // 管状珊瑚 - 橙色
                const tubeColor = 0xffa500; // 橙色
                this.createTubeCoral(coralGroup, tubeColor);
            }
            
            this.mesh = coralGroup;
            this.mesh.position.copy(this.position);
            this.scene.add(this.mesh);
        }

        createAntlerCoral(group, color) {
            const coralMaterial = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 80,
                specular: 0xffffff
            });
            
            // 主干
            const mainGeometry = new THREE.CylinderGeometry(0.2, 0.5, 1.5, 8);
            const main = new THREE.Mesh(mainGeometry, coralMaterial);
            main.position.y = 0.75;
            group.add(main);
            
            // 创建多个分支，更像鹿角
            const branchCount = 6;
            for (let i = 0; i < branchCount; i++) {
                const branchGroup = new THREE.Group();
                
                // 主分支
                const branchHeight = 0.8 + Math.random() * 0.6;
                const branchGeometry = new THREE.CylinderGeometry(0.1, 0.25, branchHeight, 6);
                const branch = new THREE.Mesh(branchGeometry, coralMaterial);
                branch.position.y = branchHeight / 2;
                branchGroup.add(branch);
                
                // 分支末端的小分支
                for (let j = 0; j < 3; j++) {
                    const smallBranchGeometry = new THREE.CylinderGeometry(0.04, 0.1, 0.4 + Math.random() * 0.3, 4);
                    const smallBranch = new THREE.Mesh(smallBranchGeometry, coralMaterial);
                    smallBranch.position.y = branchHeight - 0.1;
                    smallBranch.position.x = (Math.random() - 0.5) * 0.2;
                    smallBranch.position.z = (Math.random() - 0.5) * 0.2;
                    smallBranch.rotation.x = (Math.random() - 0.5) * 0.5;
                    smallBranch.rotation.z = (Math.random() - 0.5) * 0.5;
                    branchGroup.add(smallBranch);
                }
                
                // 放置分支
                const angle = (i / branchCount) * Math.PI * 2;
                const radius = 0.4;
                branchGroup.position.set(
                    Math.cos(angle) * radius,
                    1.0,
                    Math.sin(angle) * radius
                );
                branchGroup.rotation.x = -Math.PI / 5;
                branchGroup.rotation.z = angle;
                
                group.add(branchGroup);
            }
        }

        createBrainCoral(group, color) {
            const brainMaterial = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 60,
                specular: 0x333333
            });
            
            // 创建一个更像脑珊瑚的形状
            const baseGeometry = new THREE.SphereGeometry(1.0, 32, 32);
            
            // 修改顶点创建脑状纹理
            const positions = baseGeometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = positions.getZ(i);
                
                // 创建脑状的褶皱
                const noise1 = Math.sin(x * 4) * Math.cos(y * 4) * 0.15;
                const noise2 = Math.sin(z * 5 + y * 3) * 0.1;
                const totalNoise = noise1 + noise2;
                
                // 压扁底部，让它看起来像坐在海底
                const flattenFactor = y < -0.3 ? 0.6 : 1.0;
                
                positions.setXYZ(i, 
                    x * (1 + totalNoise) * flattenFactor,
                    y * (1 + totalNoise * 0.5) * flattenFactor + 0.1,
                    z * (1 + totalNoise) * flattenFactor
                );
            }
            baseGeometry.computeVertexNormals();
            
            const brain = new THREE.Mesh(baseGeometry, brainMaterial);
            brain.position.y = 0.6;
            group.add(brain);
            
            // 添加一些小的凸起，使它更有趣
            for (let i = 0; i < 5; i++) {
                const bumpGeometry = new THREE.SphereGeometry(0.2, 16, 16);
                const bump = new THREE.Mesh(bumpGeometry, brainMaterial);
                const angle = (i / 5) * Math.PI * 2;
                bump.position.set(
                    Math.cos(angle) * 0.6,
                    0.8 + Math.random() * 0.2,
                    Math.sin(angle) * 0.6
                );
                bump.scale.set(0.6, 0.8, 0.6);
                group.add(bump);
            }
        }

        createTubeCoral(group, color) {
            const tubeMaterial = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 70,
                specular: 0x444444
            });
            
            // 创建多个彩色管子
            const tubeCount = 10;
            for (let i = 0; i < tubeCount; i++) {
                const tubeGroup = new THREE.Group();
                
                const height = 1.2 + Math.random() * 1.0;
                const radius = 0.12 + Math.random() * 0.08;
                
                // 主管道
                const tubeGeometry = new THREE.CylinderGeometry(radius * 0.7, radius, height, 8);
                const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
                tube.position.y = height / 2;
                tubeGroup.add(tube);
                
                // 管口的彩色边缘
                const rimGeometry = new THREE.TorusGeometry(radius, 0.03, 8, 16);
                const rimColors = [0xffff00, 0xff00ff, 0x00ffff, 0xff69b4, 0x98fb98];
                const rimMaterial = new THREE.MeshPhongMaterial({
                    color: rimColors[Math.floor(Math.random() * rimColors.length)],
                    shininess: 90,
                    specular: 0xffffff
                });
                const rim = new THREE.Mesh(rimGeometry, rimMaterial);
                rim.position.y = height;
                rim.rotation.x = Math.PI / 2;
                tubeGroup.add(rim);
                
                // 放置管子
                const angle = (i / tubeCount) * Math.PI * 2;
                const dist = 0.3 + Math.random() * 0.4;
                tubeGroup.position.set(
                    Math.cos(angle) * dist,
                    0,
                    Math.sin(angle) * dist
                );
                tubeGroup.rotation.x = (Math.random() - 0.5) * 0.15;
                tubeGroup.rotation.z = (Math.random() - 0.5) * 0.15;
                
                group.add(tubeGroup);
            }
        }

        createBubble() {
            // 创建更生动的气泡
            const bubbleGeometry = new THREE.SphereGeometry(0.08 + Math.random() * 0.12, 12, 12);
            const bubbleMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7,
                shininess: 100,
                specular: 0xffffff,
                side: THREE.DoubleSide
            });
            
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            bubble.position.copy(this.position);
            bubble.position.y += 0.5; // 从珊瑚顶部开始
            bubble.position.x += (Math.random() - 0.5) * 0.4;
            bubble.position.z += (Math.random() - 0.5) * 0.4;
            
            // 气泡动画属性
            bubble.userData = {
                speed: 0.025 + Math.random() * 0.025,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.04 + Math.random() * 0.04,
                maxScale: 1 + Math.random() * 0.5
            };
            
            this.scene.add(bubble);
            this.bubbles.push(bubble);
            
            return bubble;
        }

        update() {
            // 更新气泡动画
            for (let i = this.bubbles.length - 1; i >= 0; i--) {
                const bubble = this.bubbles[i];
                
                // 向上浮动
                bubble.position.y += bubble.userData.speed;
                
                // 左右摆动
                bubble.userData.wobble += bubble.userData.wobbleSpeed;
                bubble.position.x += Math.sin(bubble.userData.wobble) * 0.012;
                bubble.position.z += Math.cos(bubble.userData.wobble) * 0.012;
                
                // 逐渐变大
                bubble.scale.multiplyScalar(1.002);
                
                // 逐渐变透明
                bubble.material.opacity -= 0.0015;
                
                // 轻微旋转
                bubble.rotation.x += 0.01;
                bubble.rotation.y += 0.01;
                
                // 如果气泡超出屏幕或完全透明，移除它
                if (bubble.position.y > 15 || bubble.material.opacity <= 0) {
                    this.scene.remove(bubble);
                    bubble.geometry.dispose();
                    bubble.material.dispose();
                    this.bubbles.splice(i, 1);
                }
            }
        }
    }

    // 海草类
    class Seaweed {
        constructor(scene, position, type = 0) {
            this.scene = scene;
            this.position = position.clone();
            this.type = type;
            this.mesh = null;
            this.bubbles = [];
            this.time = 0;
            this.createSeaweed();
        }

        createSeaweed() {
            const seaweedGroup = new THREE.Group();
            
            if (this.type === 0) {
                // 长条形海草 - 更明亮的绿色
                const seaweedColor = 0x32cd32; // 酸橙绿
                this.createLongSeaweed(seaweedGroup, seaweedColor);
            } else {
                // 扇形海草 - 蓝绿色
                const fanColor = 0x20b2aa; // 浅海绿
                this.createFanSeaweed(seaweedGroup, fanColor);
            }
            
            this.mesh = seaweedGroup;
            this.mesh.position.copy(this.position);
            this.scene.add(this.mesh);
        }

        createLongSeaweed(group, color) {
            const seaweedMaterial = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 40,
                side: THREE.DoubleSide
            });
            
            // 创建多个叶片，更自然
            const bladeCount = 6;
            for (let i = 0; i < bladeCount; i++) {
                const bladeGroup = new THREE.Group();
                
                const height = 2.0 + Math.random() * 1.5;
                const width = 0.25 + Math.random() * 0.15;
                
                // 创建扁平的叶片形状
                // 使用多个分段创建自然的形状
                const segments = 8;
                const bladeGeometry = new THREE.BufferGeometry();
                const vertices = [];
                const indices = [];
                
                for (let j = 0; j <= segments; j++) {
                    const y = (j / segments) * height;
                    // 顶部更窄
                    const taperFactor = 1 - (j / segments) * 0.6;
                    // 添加波浪形状
                    const wave = Math.sin(j * 0.8) * 0.05;
                    
                    vertices.push(
                        -width * taperFactor / 2 + wave, y, 0,
                        width * taperFactor / 2 + wave, y, 0
                    );
                }
                
                for (let j = 0; j < segments; j++) {
                    const a = j * 2;
                    const b = a + 1;
                    const c = a + 2;
                    const d = b + 2;
                    
                    indices.push(a, b, c);
                    indices.push(b, d, c);
                }
                
                bladeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                bladeGeometry.setIndex(indices);
                bladeGeometry.computeVertexNormals();
                
                const blade = new THREE.Mesh(bladeGeometry, seaweedMaterial);
                
                // 保存动画数据
                blade.userData = {
                    waveOffset: Math.random() * Math.PI * 2,
                    waveSpeed: 0.02 + Math.random() * 0.02,
                    baseRotationX: 0,
                    baseRotationZ: 0
                };
                
                bladeGroup.add(blade);
                
                // 放置叶片
                const angle = (i / bladeCount) * Math.PI * 2;
                const dist = 0.15 + Math.random() * 0.25;
                bladeGroup.position.set(
                    Math.cos(angle) * dist,
                    0,
                    Math.sin(angle) * dist
                );
                bladeGroup.rotation.y = angle;
                
                group.add(bladeGroup);
            }
        }

        createFanSeaweed(group, color) {
            const fanMaterial = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 50,
                side: THREE.DoubleSide
            });
            
            // 茎
            const stemGeometry = new THREE.CylinderGeometry(0.04, 0.08, 1.8, 8);
            const stem = new THREE.Mesh(stemGeometry, fanMaterial);
            stem.position.y = 0.9;
            group.add(stem);
            
            // 创建多个扇形叶片，像孔雀的尾巴
            const fanCount = 5;
            for (let i = 0; i < fanCount; i++) {
                const fanGroup = new THREE.Group();
                
                // 创建扇形形状
                const segments = 12;
                const radius = 0.6 - i * 0.08;
                const angleStart = -Math.PI / 3;
                const angleEnd = Math.PI / 3;
                
                const fanGeometry = new THREE.BufferGeometry();
                const vertices = [];
                const indices = [];
                
                // 中心顶点
                vertices.push(0, 0, 0);
                
                // 边缘顶点
                for (let j = 0; j <= segments; j++) {
                    const angle = angleStart + (j / segments) * (angleEnd - angleStart);
                    const wave = Math.sin(j * 0.5) * 0.05;
                    vertices.push(
                        Math.cos(angle) * radius + wave,
                        Math.sin(angle) * radius * 0.3,
                        0
                    );
                }
                
                // 创建面
                for (let j = 0; j < segments; j++) {
                    indices.push(0, j + 1, j + 2);
                }
                
                fanGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                fanGeometry.setIndex(indices);
                fanGeometry.computeVertexNormals();
                
                // 为扇形添加彩色边缘
                const edgeGeometry = new THREE.RingGeometry(radius * 0.9, radius, segments, 1, angleStart, angleEnd - angleStart);
                const edgeColors = [0xffff00, 0xff69b4, 0x00ff00, 0x00ffff];
                const edgeMaterial = new THREE.MeshPhongMaterial({
                    color: edgeColors[Math.floor(Math.random() * edgeColors.length)],
                    shininess: 80,
                    side: THREE.DoubleSide
                });
                const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
                edge.position.z = 0.01;
                
                const fan = new THREE.Mesh(fanGeometry, fanMaterial);
                fanGroup.add(fan);
                fanGroup.add(edge);
                
                // 放置扇形
                const yOffset = 1.4 + i * 0.25;
                const xRotation = -Math.PI / 4 + (i / fanCount) * 0.3;
                fanGroup.position.y = yOffset;
                fanGroup.rotation.x = xRotation;
                fanGroup.rotation.y = (i % 2 === 0 ? 1 : -1) * Math.PI / 6;
                
                // 保存动画数据
                fanGroup.userData = {
                    waveOffset: Math.random() * Math.PI * 2,
                    waveSpeed: 0.025 + Math.random() * 0.015
                };
                
                group.add(fanGroup);
            }
        }

        createBubble() {
            // 创建气泡
            const bubbleGeometry = new THREE.SphereGeometry(0.06 + Math.random() * 0.1, 10, 10);
            const bubbleMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8,
                shininess: 100,
                specular: 0xffffff,
                side: THREE.DoubleSide
            });
            
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            bubble.position.copy(this.position);
            bubble.position.y += 1.0; // 从海草顶部开始
            bubble.position.x += (Math.random() - 0.5) * 0.3;
            bubble.position.z += (Math.random() - 0.5) * 0.3;
            
            // 气泡动画属性
            bubble.userData = {
                speed: 0.03 + Math.random() * 0.02,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.05 + Math.random() * 0.03
            };
            
            this.scene.add(bubble);
            this.bubbles.push(bubble);
            
            return bubble;
        }

        update() {
            this.time += 0.016; // 假设60fps
            
            // 更新海草摆动动画
            if (this.mesh) {
                this.mesh.children.forEach(bladeGroup => {
                    bladeGroup.children.forEach(child => {
                        if (child.userData && child.userData.waveOffset !== undefined) {
                            const wave = Math.sin(this.time * child.userData.waveSpeed * 8 + child.userData.waveOffset);
                            child.rotation.x = wave * 0.15;
                            child.rotation.z = wave * 0.1;
                        }
                    });
                    
                    // 整个叶片组也轻微摆动
                    if (bladeGroup.userData && bladeGroup.userData.waveOffset !== undefined) {
                        const wave = Math.sin(this.time * bladeGroup.userData.waveSpeed * 6 + bladeGroup.userData.waveOffset);
                        bladeGroup.rotation.x = wave * 0.1;
                        bladeGroup.rotation.z = wave * 0.08;
                    }
                });
            }
            
            // 更新气泡动画
            for (let i = this.bubbles.length - 1; i >= 0; i--) {
                const bubble = this.bubbles[i];
                
                // 向上浮动
                bubble.position.y += bubble.userData.speed;
                
                // 左右摆动
                bubble.userData.wobble += bubble.userData.wobbleSpeed;
                bubble.position.x += Math.sin(bubble.userData.wobble) * 0.01;
                bubble.position.z += Math.cos(bubble.userData.wobble) * 0.01;
                
                // 逐渐变大
                bubble.scale.multiplyScalar(1.0015);
                
                // 逐渐变透明
                bubble.material.opacity -= 0.002;
                
                // 轻微旋转
                bubble.rotation.x += 0.008;
                bubble.rotation.y += 0.008;
                
                // 如果气泡超出屏幕或完全透明，移除它
                if (bubble.position.y > 15 || bubble.material.opacity <= 0) {
                    this.scene.remove(bubble);
                    bubble.geometry.dispose();
                    bubble.material.dispose();
                    this.bubbles.splice(i, 1);
                }
            }
        }
    }

    // 小型海葵类植物
    class SeaAnemone {
        constructor(scene, position) {
            this.scene = scene;
            this.position = position.clone();
            this.mesh = null;
            this.bubbles = [];
            this.time = Math.random() * 100;
            this.createAnemone();
        }

        createAnemone() {
            const group = new THREE.Group();
            
            // 底座
            const baseGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.15, 8);
            const baseMaterial = new THREE.MeshPhongMaterial({
                color: 0xffb6c1, // 浅粉色
                shininess: 50
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = 0.075;
            group.add(base);
            
            // 触手 - 多个柔软的触手
            const tentacleColors = [0xff69b4, 0xff1493, 0xffb6c1, 0xff6347, 0x00ced1];
            const tentacleMaterial = new THREE.MeshPhongMaterial({
                color: tentacleColors[Math.floor(Math.random() * tentacleColors.length)],
                shininess: 60
            });
            
            const tentacleCount = 12 + Math.floor(Math.random() * 8);
            this.tentacles = [];
            
            for (let i = 0; i < tentacleCount; i++) {
                const tentacleGroup = new THREE.Group();
                
                // 触手由多个段组成
                const segments = 5;
                const baseLength = 0.4 + Math.random() * 0.4;
                
                for (let j = 0; j < segments; j++) {
                    const radius = 0.04 * (1 - j * 0.15);
                    const segmentGeometry = new THREE.CylinderGeometry(radius * 0.8, radius, baseLength / segments, 6);
                    const segment = new THREE.Mesh(segmentGeometry, tentacleMaterial);
                    segment.position.y = baseLength / segments * (j + 0.5);
                    tentacleGroup.add(segment);
                }
                
                const angle = (i / tentacleCount) * Math.PI * 2;
                const dist = 0.12 + Math.random() * 0.08;
                tentacleGroup.position.set(
                    Math.cos(angle) * dist,
                    0.15,
                    Math.sin(angle) * dist
                );
                
                tentacleGroup.rotation.x = Math.PI / 4 + Math.random() * 0.2;
                tentacleGroup.rotation.z = angle;
                
                tentacleGroup.userData = {
                    waveOffset: Math.random() * Math.PI * 2,
                    waveSpeed: 0.03 + Math.random() * 0.02,
                    baseAngle: angle
                };
                
                group.add(tentacleGroup);
                this.tentacles.push(tentacleGroup);
            }
            
            // 中心口盘
            const mouthGeometry = new THREE.CircleGeometry(0.12, 8);
            const mouthMaterial = new THREE.MeshPhongMaterial({
                color: 0xff1493,
                shininess: 70,
                side: THREE.DoubleSide
            });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.y = 0.18;
            mouth.rotation.x = -Math.PI / 2;
            group.add(mouth);
            
            this.mesh = group;
            this.mesh.position.copy(this.position);
            this.scene.add(this.mesh);
        }

        createBubble() {
            const bubbleGeometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.06, 8, 8);
            const bubbleMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7,
                shininess: 100,
                specular: 0xffffff,
                side: THREE.DoubleSide
            });
            
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            bubble.position.copy(this.position);
            bubble.position.y += 0.4;
            bubble.position.x += (Math.random() - 0.5) * 0.2;
            bubble.position.z += (Math.random() - 0.5) * 0.2;
            
            bubble.userData = {
                speed: 0.02 + Math.random() * 0.02,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.04 + Math.random() * 0.03
            };
            
            this.scene.add(bubble);
            this.bubbles.push(bubble);
            return bubble;
        }

        update() {
            this.time += 0.016;
            
            // 更新触手摆动
            if (this.tentacles) {
                this.tentacles.forEach(tentacle => {
                    const wave = Math.sin(this.time * tentacle.userData.waveSpeed * 6 + tentacle.userData.waveOffset);
                    tentacle.rotation.x = Math.PI / 4 + wave * 0.25;
                    tentacle.rotation.z = tentacle.userData.baseAngle + wave * 0.1;
                    
                    // 每段单独摆动
                    tentacle.children.forEach((segment, index) => {
                        if (segment.isMesh) {
                            segment.rotation.z = wave * 0.15 * (1 + index * 0.1);
                        }
                    });
                });
            }
            
            // 更新气泡
            for (let i = this.bubbles.length - 1; i >= 0; i--) {
                const bubble = this.bubbles[i];
                bubble.position.y += bubble.userData.speed;
                bubble.userData.wobble += bubble.userData.wobbleSpeed;
                bubble.position.x += Math.sin(bubble.userData.wobble) * 0.008;
                bubble.position.z += Math.cos(bubble.userData.wobble) * 0.008;
                bubble.scale.multiplyScalar(1.0015);
                bubble.material.opacity -= 0.002;
                
                if (bubble.position.y > 15 || bubble.material.opacity <= 0) {
                    this.scene.remove(bubble);
                    bubble.geometry.dispose();
                    bubble.material.dispose();
                    this.bubbles.splice(i, 1);
                }
            }
        }
    }

    // 小型海星
    class Starfish {
        constructor(scene, position) {
            this.scene = scene;
            this.position = position.clone();
            this.mesh = null;
            this.bubbles = [];
            this.createStarfish();
        }

        createStarfish() {
            const group = new THREE.Group();
            
            const armCount = 5;
            const armColors = [0xff6347, 0xffa500, 0xff4500, 0xff69b4, 0x00ced1];
            const starMaterial = new THREE.MeshPhongMaterial({
                color: armColors[Math.floor(Math.random() * armColors.length)],
                shininess: 50
            });
            
            // 中心盘
            const centerGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.08, 16);
            const center = new THREE.Mesh(centerGeometry, starMaterial);
            center.position.y = 0.04;
            group.add(center);
            
            // 5条臂
            for (let i = 0; i < armCount; i++) {
                const armGroup = new THREE.Group();
                
                // 臂的形状 - 由多个几何体组成
                for (let j = 0; j < 4; j++) {
                    const length = 0.5 - j * 0.1;
                    const radius = 0.08 * (1 - j * 0.15);
                    const armGeometry = new THREE.CapsuleGeometry(radius, length, 4, 8);
                    const arm = new THREE.Mesh(armGeometry, starMaterial);
                    arm.position.y = 0.04 + j * 0.2;
                    armGroup.add(arm);
                }
                
                const angle = (i / armCount) * Math.PI * 2;
                armGroup.position.set(
                    Math.cos(angle) * 0.15,
                    0.04,
                    Math.sin(angle) * 0.15
                );
                armGroup.rotation.x = Math.PI / 6;
                armGroup.rotation.z = angle;
                
                group.add(armGroup);
            }
            
            // 微小的凸起装饰
            const bumpCount = 10;
            const bumpMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 60
            });
            
            for (let i = 0; i < bumpCount; i++) {
                const bumpGeometry = new THREE.SphereGeometry(0.02, 6, 6);
                const bump = new THREE.Mesh(bumpGeometry, bumpMaterial);
                const angle = Math.random() * Math.PI * 2;
                const dist = 0.05 + Math.random() * 0.1;
                bump.position.set(
                    Math.cos(angle) * dist,
                    0.1 + Math.random() * 0.05,
                    Math.sin(angle) * dist
                );
                bump.scale.set(1, 1.5, 1);
                group.add(bump);
            }
            
            this.mesh = group;
            this.mesh.position.copy(this.position);
            this.mesh.rotation.x = Math.PI / 12; // 稍微倾斜，看起来更自然
            this.scene.add(this.mesh);
        }

        createBubble() {
            const bubbleGeometry = new THREE.SphereGeometry(0.04 + Math.random() * 0.05, 8, 8);
            const bubbleMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7,
                shininess: 100,
                specular: 0xffffff,
                side: THREE.DoubleSide
            });
            
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            bubble.position.copy(this.position);
            bubble.position.y += 0.3;
            bubble.position.x += (Math.random() - 0.5) * 0.15;
            bubble.position.z += (Math.random() - 0.5) * 0.15;
            
            bubble.userData = {
                speed: 0.018 + Math.random() * 0.015,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.04 + Math.random() * 0.03
            };
            
            this.scene.add(bubble);
            this.bubbles.push(bubble);
            return bubble;
        }

        update() {
            // 更新气泡
            for (let i = this.bubbles.length - 1; i >= 0; i--) {
                const bubble = this.bubbles[i];
                bubble.position.y += bubble.userData.speed;
                bubble.userData.wobble += bubble.userData.wobbleSpeed;
                bubble.position.x += Math.sin(bubble.userData.wobble) * 0.006;
                bubble.position.z += Math.cos(bubble.userData.wobble) * 0.006;
                bubble.scale.multiplyScalar(1.0012);
                bubble.material.opacity -= 0.0018;
                
                if (bubble.position.y > 15 || bubble.material.opacity <= 0) {
                    this.scene.remove(bubble);
                    bubble.geometry.dispose();
                    bubble.material.dispose();
                    this.bubbles.splice(i, 1);
                }
            }
        }
    }

    // 工厂函数，用于创建海底植物 - 更密集
    function createSeabedPlants(scene, width, depth) {
        const plants = [];
        
        // 大型植物（珊瑚、海草）- 25个，更密集
        const largePlantCount = 25;
        for (let i = 0; i < largePlantCount; i++) {
            const x = (Math.random() - 0.5) * width * 0.95;
            const z = (Math.random() - 0.5) * depth * 0.95;
            const position = new THREE.Vector3(x, -5, z); // 新的海底高度
            
            const type = Math.floor(Math.random() * 3);
            
            if (Math.random() > 0.5) {
                plants.push(new Coral(scene, position, type));
            } else {
                plants.push(new Seaweed(scene, position, type % 2));
            }
        }
        
        // 海葵 - 35个，更多
        const anemoneCount = 35;
        for (let i = 0; i < anemoneCount; i++) {
            const x = (Math.random() - 0.5) * width * 0.98;
            const z = (Math.random() - 0.5) * depth * 0.98;
            const position = new THREE.Vector3(x, -5, z);
            plants.push(new SeaAnemone(scene, position));
        }
        
        // 海星 - 20个，更多
        const starfishCount = 20;
        for (let i = 0; i < starfishCount; i++) {
            const x = (Math.random() - 0.5) * width * 0.98;
            const z = (Math.random() - 0.5) * depth * 0.98;
            const position = new THREE.Vector3(x, -4.95, z); // 稍微高一点
            plants.push(new Starfish(scene, position));
        }
        
        // 额外的小型海草 - 30个，铺满空白
        const extraSeaweedCount = 30;
        for (let i = 0; i < extraSeaweedCount; i++) {
            const x = (Math.random() - 0.5) * width * 0.98;
            const z = (Math.random() - 0.5) * depth * 0.98;
            const position = new THREE.Vector3(x, -5, z);
            const type = i % 2;
            const seaweed = new Seaweed(scene, position, type);
            // 缩放小一点，让布局更自然
            if (seaweed.mesh) {
                seaweed.mesh.scale.setScalar(0.6 + Math.random() * 0.4);
            }
            plants.push(seaweed);
        }
        
        return plants;
    }

    // 暴露到全局
    global.createSeabedPlants = createSeabedPlants;
    global.Coral = Coral;
    global.Seaweed = Seaweed;

})(window);
