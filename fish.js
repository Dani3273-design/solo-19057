// fish.js - 鱼相关代码 - 改进版

(function(global) {
    'use strict';

    // 场景边界定义
    const BOUNDS = {
        minX: -25,
        maxX: 25,
        minY: -3,
        maxY: 15,
        minZ: -25,
        maxZ: 25
    };

    // 基础鱼类
    class Fish {
        constructor(scene, position, type = 0) {
            this.scene = scene;
            this.position = position.clone();
            this.type = type;
            this.mesh = null;
            this.velocity = new THREE.Vector3(0, 0, 0);
            this.isScared = false;
            this.scaredTime = 0;
            this.time = Math.random() * 100;
            this.originalScale = new THREE.Vector3(1, 1, 1);
            
            // 游动参数
            this.baseSpeed = 0.015 + Math.random() * 0.01;
            this.scaredSpeedMultiplier = 4;
            this.turnSpeed = 0.02;
            this.targetRotation = 0;
            this.currentRotation = 0;
            
            // 引用各部分组件
            this.body = null;
            this.tail = null;
            this.leftEye = null;
            this.rightEye = null;
            this.mouth = null;
            this.leftPectoralFin = null;
            this.rightPectoralFin = null;
            this.dorsalFin = null;
            
            // 原始尺寸
            this.originalEyeScale = null;
            this.originalMouthScale = null;
            
            // 动画参数
            this.tailWagSpeed = 8;
            this.tailWagAmount = 0.3;
            this.finWagSpeed = 6;
            this.finWagAmount = 0.2;
            
            this.createFish();
        }

        createFish() {
            const fishGroup = new THREE.Group();
            
            if (this.type === 0) {
                // 小丑鱼
                this.createClownfish(fishGroup);
            } else if (this.type === 1) {
                // 鲨鱼
                this.createShark(fishGroup);
            } else if (this.type === 2) {
                // 章鱼
                this.createOctopus(fishGroup);
            } else {
                // 海马
                this.createSeahorse(fishGroup);
            }
            
            this.mesh = fishGroup;
            this.mesh.position.copy(this.position);
            this.scene.add(this.mesh);
            
            // 设置随机初始方向
            this.targetRotation = Math.random() * Math.PI * 2;
            this.currentRotation = this.targetRotation;
            this.mesh.rotation.y = this.currentRotation;
        }

        createClownfish(group) {
            // 小丑鱼颜色：鲜艳的橙色带白色条纹
            const bodyColor = 0xff8c00; // 深橙色
            const stripeColor = 0xffffff; // 白色
            const finColor = 0xffffff; // 白色鱼鳍
            
            // 创建更自然的鱼身体形状
            // 使用多个几何体组合成流线型
            
            // 主身体 - 使用胶囊形状
            const bodyGroup = new THREE.Group();
            
            // 身体前部（较宽）
            const frontGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: bodyColor,
                shininess: 80,
                specular: 0xffffff
            });
            
            const front = new THREE.Mesh(frontGeometry, bodyMaterial);
            front.scale.set(1.2, 0.9, 1);
            front.position.x = 0.3;
            bodyGroup.add(front);
            
            // 身体中部
            const middleGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 16);
            const middle = new THREE.Mesh(middleGeometry, bodyMaterial);
            middle.rotation.z = Math.PI / 2;
            bodyGroup.add(middle);
            
            // 身体后部（较窄）
            const backGeometry = new THREE.ConeGeometry(0.35, 0.8, 16);
            const back = new THREE.Mesh(backGeometry, bodyMaterial);
            back.rotation.z = -Math.PI / 2;
            back.position.x = -0.8;
            bodyGroup.add(back);
            
            // 添加白色条纹
            const stripeMaterial = new THREE.MeshPhongMaterial({
                color: stripeColor,
                shininess: 100,
                specular: 0xffffff
            });
            
            // 第一条条纹（靠近头部）
            const stripe1Geometry = new THREE.TorusGeometry(0.48, 0.06, 8, 16);
            const stripe1 = new THREE.Mesh(stripe1Geometry, stripeMaterial);
            stripe1.position.x = 0.5;
            stripe1.rotation.z = Math.PI / 2;
            bodyGroup.add(stripe1);
            
            // 第二条条纹（中间）
            const stripe2Geometry = new THREE.TorusGeometry(0.42, 0.06, 8, 16);
            const stripe2 = new THREE.Mesh(stripe2Geometry, stripeMaterial);
            stripe2.position.x = -0.1;
            stripe2.rotation.z = Math.PI / 2;
            bodyGroup.add(stripe2);
            
            // 第三条条纹（靠近尾部）
            const stripe3Geometry = new THREE.TorusGeometry(0.35, 0.05, 8, 16);
            const stripe3 = new THREE.Mesh(stripe3Geometry, stripeMaterial);
            stripe3.position.x = -0.7;
            stripe3.rotation.z = Math.PI / 2;
            bodyGroup.add(stripe3);
            
            group.add(bodyGroup);
            this.body = bodyGroup;
            
            // 尾巴 - 更像鱼的尾鳍
            const tailGroup = new THREE.Group();
            const tailMaterial = new THREE.MeshPhongMaterial({
                color: stripeColor,
                shininess: 80,
                side: THREE.DoubleSide
            });
            
            // 创建半月形尾巴
            const tailShape = new THREE.Shape();
            tailShape.moveTo(0, 0);
            tailShape.quadraticCurveTo(0.3, 0.4, 0.6, 0.5);
            tailShape.quadraticCurveTo(0.3, 0.25, 0, 0.5);
            tailShape.quadraticCurveTo(-0.3, 0.25, -0.6, 0.5);
            tailShape.quadraticCurveTo(-0.3, 0.4, 0, 0);
            
            const tailExtrudeSettings = {
                depth: 0.05,
                bevelEnabled: false
            };
            
            const tailGeometry = new THREE.ExtrudeGeometry(tailShape, tailExtrudeSettings);
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.rotation.y = Math.PI / 2;
            tail.position.x = -1.2;
            tailGroup.add(tail);
            
            group.add(tailGroup);
            this.tail = tailGroup;
            
            // 背鳍
            const dorsalFinMaterial = new THREE.MeshPhongMaterial({
                color: stripeColor,
                shininess: 80,
                side: THREE.DoubleSide
            });
            
            // 背鳍形状
            const dorsalFinShape = new THREE.Shape();
            dorsalFinShape.moveTo(0, 0);
            dorsalFinShape.quadraticCurveTo(0.2, 0.4, 0.4, 0.6);
            dorsalFinShape.quadraticCurveTo(0.2, 0.2, 0, 0);
            
            const dorsalFinExtrudeSettings = {
                depth: 0.05,
                bevelEnabled: false
            };
            
            const dorsalFinGeometry = new THREE.ExtrudeGeometry(dorsalFinShape, dorsalFinExtrudeSettings);
            const dorsalFin = new THREE.Mesh(dorsalFinGeometry, dorsalFinMaterial);
            dorsalFin.position.set(0, 0.45, 0);
            dorsalFin.rotation.x = -Math.PI / 6;
            group.add(dorsalFin);
            this.dorsalFin = dorsalFin;
            
            // 胸鳍
            const pectoralFinShape = new THREE.Shape();
            pectoralFinShape.moveTo(0, 0);
            pectoralFinShape.quadraticCurveTo(0.2, 0.2, 0.4, 0.15);
            pectoralFinShape.quadraticCurveTo(0.2, 0.1, 0, 0);
            
            const pectoralFinExtrudeSettings = {
                depth: 0.04,
                bevelEnabled: false
            };
            
            const pectoralFinGeometry = new THREE.ExtrudeGeometry(pectoralFinShape, pectoralFinExtrudeSettings);
            const pectoralFinMaterial = new THREE.MeshPhongMaterial({
                color: stripeColor,
                shininess: 80,
                side: THREE.DoubleSide
            });
            
            // 左胸鳍
            const leftPectoralFin = new THREE.Mesh(pectoralFinGeometry, pectoralFinMaterial);
            leftPectoralFin.position.set(0, -0.15, 0.45);
            leftPectoralFin.rotation.x = Math.PI / 4;
            leftPectoralFin.rotation.y = -Math.PI / 4;
            group.add(leftPectoralFin);
            this.leftPectoralFin = leftPectoralFin;
            
            // 右胸鳍
            const rightPectoralFin = new THREE.Mesh(pectoralFinGeometry, pectoralFinMaterial);
            rightPectoralFin.position.set(0, -0.15, -0.45);
            rightPectoralFin.rotation.x = -Math.PI / 4;
            rightPectoralFin.rotation.y = Math.PI / 4;
            group.add(rightPectoralFin);
            this.rightPectoralFin = rightPectoralFin;
            
            // 眼睛 - 更明显的大眼睛
            const eyeMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 100,
                specular: 0xffffff
            });
            
            const pupilMaterial = new THREE.MeshPhongMaterial({
                color: 0x000000,
                shininess: 100
            });
            
            // 左眼
            const leftEyeGroup = new THREE.Group();
            const leftEyeGeometry = new THREE.SphereGeometry(0.12, 12, 12);
            const leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
            leftEyeGroup.add(leftEye);
            
            const leftPupilGeometry = new THREE.SphereGeometry(0.06, 10, 10);
            const leftPupil = new THREE.Mesh(leftPupilGeometry, pupilMaterial);
            leftPupil.position.set(0.06, 0, 0.08);
            leftEyeGroup.add(leftPupil);
            
            leftEyeGroup.position.set(0.55, 0.15, 0.35);
            group.add(leftEyeGroup);
            this.leftEye = leftEyeGroup;
            this.originalEyeScale = leftEyeGroup.scale.clone();
            
            // 右眼
            const rightEyeGroup = new THREE.Group();
            const rightEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
            rightEyeGroup.add(rightEye);
            
            const rightPupil = new THREE.Mesh(leftPupilGeometry, pupilMaterial);
            rightPupil.position.set(0.06, 0, -0.08);
            rightEyeGroup.add(rightPupil);
            
            rightEyeGroup.position.set(0.55, 0.15, -0.35);
            group.add(rightEyeGroup);
            this.rightEye = rightEyeGroup;
            
            // 嘴巴 - 更明显的嘴巴
            const mouthGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const mouthMaterial = new THREE.MeshPhongMaterial({
                color: 0x2f2f2f,
                shininess: 50
            });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(0.7, 0, 0);
            mouth.scale.set(1, 0.4, 0.6);
            group.add(mouth);
            this.mouth = mouth;
            this.originalMouthScale = mouth.scale.clone();
            
            // 眼睛高光 - 让眼睛更突出
            const eyeHighlightGeometry = new THREE.SphereGeometry(0.02, 8, 8);
            const eyeHighlightMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 100,
                transparent: true,
                opacity: 0.8
            });
            
            const leftHighlight = new THREE.Mesh(eyeHighlightGeometry, eyeHighlightMaterial);
            leftHighlight.position.set(0.58, 0.22, 0.4);
            group.add(leftHighlight);
            
            const rightHighlight = new THREE.Mesh(eyeHighlightGeometry, eyeHighlightMaterial);
            rightHighlight.position.set(0.58, 0.22, -0.4);
            group.add(rightHighlight);
        }

        createShark(group) {
            // 鲨鱼颜色：灰色
            const bodyColor = 0x708090; // 石板灰
            const bellyColor = 0xe8e8e8; // 浅灰色
            const finColor = 0x696969; // 深灰色
            
            // 鲨鱼身体 - 更长更流线型
            const bodyGroup = new THREE.Group();
            
            // 身体前部
            const frontGeometry = new THREE.SphereGeometry(0.8, 16, 16);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: bodyColor,
                shininess: 60,
                specular: 0x333333
            });
            
            const front = new THREE.Mesh(frontGeometry, bodyMaterial);
            front.scale.set(1.5, 1.1, 1.2);
            front.position.x = 0.8;
            bodyGroup.add(front);
            
            // 身体中部
            const middleGeometry = new THREE.CylinderGeometry(0.6, 0.7, 2.5, 16);
            const middle = new THREE.Mesh(middleGeometry, bodyMaterial);
            middle.rotation.z = Math.PI / 2;
            middle.scale.y = 1.1;
            bodyGroup.add(middle);
            
            // 身体后部
            const backGeometry = new THREE.ConeGeometry(0.5, 1.5, 16);
            const back = new THREE.Mesh(backGeometry, bodyMaterial);
            back.rotation.z = -Math.PI / 2;
            back.position.x = -1.8;
            bodyGroup.add(back);
            
            // 腹部（下半部分颜色较浅）
            const bellyGeometry = new THREE.CylinderGeometry(0.55, 0.65, 3.5, 16);
            const bellyMaterial = new THREE.MeshPhongMaterial({
                color: bellyColor,
                shininess: 40
            });
            const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
            belly.rotation.z = Math.PI / 2;
            belly.position.y = -0.3;
            belly.scale.y = 0.5;
            bodyGroup.add(belly);
            
            group.add(bodyGroup);
            this.body = bodyGroup;
            
            // 背鳍 - 更明显的鲨鱼背鳍
            const dorsalFinGroup = new THREE.Group();
            
            const dorsalFinShape = new THREE.Shape();
            dorsalFinShape.moveTo(0, 0);
            dorsalFinShape.lineTo(0.3, 1.2);
            dorsalFinShape.lineTo(0.8, 0);
            dorsalFinShape.lineTo(0, 0);
            
            const dorsalFinExtrudeSettings = {
                depth: 0.2,
                bevelEnabled: false
            };
            
            const dorsalFinGeometry = new THREE.ExtrudeGeometry(dorsalFinShape, dorsalFinExtrudeSettings);
            const finMaterial = new THREE.MeshPhongMaterial({
                color: finColor,
                shininess: 50
            });
            
            const dorsalFin = new THREE.Mesh(dorsalFinGeometry, finMaterial);
            dorsalFin.position.set(0, 0.8, -0.1);
            dorsalFin.rotation.x = -Math.PI / 12;
            dorsalFinGroup.add(dorsalFin);
            
            group.add(dorsalFinGroup);
            this.dorsalFin = dorsalFinGroup;
            
            // 胸鳍
            const pectoralFinShape = new THREE.Shape();
            pectoralFinShape.moveTo(0, 0);
            pectoralFinShape.lineTo(0.8, 0.2);
            pectoralFinShape.lineTo(0.8, 0.4);
            pectoralFinShape.lineTo(0.2, 0.3);
            pectoralFinShape.lineTo(0, 0);
            
            const pectoralFinExtrudeSettings = {
                depth: 0.1,
                bevelEnabled: false
            };
            
            const pectoralFinGeometry = new THREE.ExtrudeGeometry(pectoralFinShape, pectoralFinExtrudeSettings);
            
            // 左胸鳍
            const leftPectoralFin = new THREE.Mesh(pectoralFinGeometry, finMaterial);
            leftPectoralFin.position.set(0.3, -0.3, 0.8);
            leftPectoralFin.rotation.x = Math.PI / 3;
            leftPectoralFin.rotation.y = -Math.PI / 6;
            group.add(leftPectoralFin);
            this.leftPectoralFin = leftPectoralFin;
            
            // 右胸鳍
            const rightPectoralFin = new THREE.Mesh(pectoralFinGeometry, finMaterial);
            rightPectoralFin.position.set(0.3, -0.3, -0.8);
            rightPectoralFin.rotation.x = -Math.PI / 3;
            rightPectoralFin.rotation.y = Math.PI / 6;
            group.add(rightPectoralFin);
            this.rightPectoralFin = rightPectoralFin;
            
            // 尾巴 - 鲨鱼尾鳍
            const tailGroup = new THREE.Group();
            
            // 上叶
            const upperTailShape = new THREE.Shape();
            upperTailShape.moveTo(0, 0);
            upperTailShape.quadraticCurveTo(0.3, 0.8, 0.8, 1.0);
            upperTailShape.quadraticCurveTo(0.4, 0.4, 0, 0);
            
            const upperTailGeometry = new THREE.ExtrudeGeometry(upperTailShape, {
                depth: 0.15,
                bevelEnabled: false
            });
            
            const upperTail = new THREE.Mesh(upperTailGeometry, finMaterial);
            upperTail.position.set(-2.8, 0.2, 0);
            upperTail.rotation.x = -Math.PI / 10;
            tailGroup.add(upperTail);
            
            // 下叶
            const lowerTailShape = new THREE.Shape();
            lowerTailShape.moveTo(0, 0);
            lowerTailShape.quadraticCurveTo(0.3, -0.4, 0.7, -0.5);
            lowerTailShape.quadraticCurveTo(0.3, -0.2, 0, 0);
            
            const lowerTailGeometry = new THREE.ExtrudeGeometry(lowerTailShape, {
                depth: 0.15,
                bevelEnabled: false
            });
            
            const lowerTail = new THREE.Mesh(lowerTailGeometry, finMaterial);
            lowerTail.position.set(-2.8, 0.1, 0);
            lowerTail.rotation.x = Math.PI / 10;
            tailGroup.add(lowerTail);
            
            group.add(tailGroup);
            this.tail = tailGroup;
            
            // 眼睛 - 鲨鱼的眼睛
            const eyeMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 80
            });
            
            const pupilMaterial = new THREE.MeshPhongMaterial({
                color: 0x1a1a1a,
                shininess: 80
            });
            
            // 左眼
            const leftEyeGroup = new THREE.Group();
            const leftEyeGeometry = new THREE.SphereGeometry(0.1, 10, 10);
            const leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
            leftEyeGroup.add(leftEye);
            
            const leftPupilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const leftPupil = new THREE.Mesh(leftPupilGeometry, pupilMaterial);
            leftPupil.position.set(0.05, 0, 0.08);
            leftEyeGroup.add(leftPupil);
            
            leftEyeGroup.position.set(1.0, 0.25, 0.6);
            group.add(leftEyeGroup);
            this.leftEye = leftEyeGroup;
            this.originalEyeScale = leftEyeGroup.scale.clone();
            
            // 右眼
            const rightEyeGroup = new THREE.Group();
            const rightEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
            rightEyeGroup.add(rightEye);
            
            const rightPupil = new THREE.Mesh(leftPupilGeometry, pupilMaterial);
            rightPupil.position.set(0.05, 0, -0.08);
            rightEyeGroup.add(rightPupil);
            
            rightEyeGroup.position.set(1.0, 0.25, -0.6);
            group.add(rightEyeGroup);
            this.rightEye = rightEyeGroup;
            
            // 嘴巴 - 鲨鱼的嘴
            const mouthShape = new THREE.Shape();
            mouthShape.moveTo(0, 0);
            mouthShape.quadraticCurveTo(0.3, -0.1, 0.6, -0.05);
            mouthShape.quadraticCurveTo(0.3, 0, 0, 0);
            
            const mouthGeometry = new THREE.ExtrudeGeometry(mouthShape, {
                depth: 0.3,
                bevelEnabled: false
            });
            
            const mouthMaterial = new THREE.MeshPhongMaterial({
                color: 0x2f2f2f,
                shininess: 30
            });
            
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(1.1, -0.3, 0);
            mouth.rotation.x = Math.PI / 6;
            group.add(mouth);
            this.mouth = mouth;
            this.originalMouthScale = new THREE.Vector3(1, 1, 1);
        }

        createOctopus(group) {
            // 章鱼颜色：更鲜艳的橙色
            const bodyColor = 0xff7f50; // 珊瑚橙
            const tentacleColor = 0xff6347; // 番茄红
            const suckerColor = 0xffdab9; // 桃色
            
            // 章鱼身体
            const bodyGroup = new THREE.Group();
            
            // 身体（椭圆形，更像章鱼的头足）
            const bodyGeometry = new THREE.SphereGeometry(0.9, 20, 20);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: bodyColor,
                shininess: 70,
                specular: 0x666666
            });
            
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.scale.set(1.1, 0.9, 1.2); // 更扁长的形状
            bodyGroup.add(body);
            
            // 身体底部（更宽）
            const bottomGeometry = new THREE.SphereGeometry(0.6, 16, 16);
            const bottomMaterial = new THREE.MeshPhongMaterial({
                color: bodyColor,
                shininess: 60
            });
            const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
            bottom.position.set(0, -0.5, 0);
            bottom.scale.set(1.5, 0.7, 1.5);
            bodyGroup.add(bottom);
            
            // 头部突出部分（眼睛上方）
            const headGeometry = new THREE.SphereGeometry(0.4, 12, 12);
            const headMaterial = new THREE.MeshPhongMaterial({
                color: bodyColor,
                shininess: 70
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(0.2, 0.5, 0);
            head.scale.set(1.3, 0.9, 1);
            bodyGroup.add(head);
            
            group.add(bodyGroup);
            this.body = bodyGroup;
            
            // 触手 - 8条，使用更自然的分段和动画
            this.tentacles = [];
            const tentacleMaterial = new THREE.MeshPhongMaterial({
                color: tentacleColor,
                shininess: 55
            });
            
            for (let i = 0; i < 8; i++) {
                const tentacleGroup = new THREE.Group();
                
                // 创建由多个段组成的触手
                const segments = 14; // 更多段，更细腻
                const baseRadius = 0.11;
                const baseLength = 0.35;
                
                // 保存每段的引用，用于动画
                tentacleGroup.userData.segments = [];
                tentacleGroup.userData.suckers = [];
                
                for (let j = 0; j < segments; j++) {
                    const segmentGroup = new THREE.Group();
                    
                    // 每段逐渐变细
                    const taperFactor = 1 - j * 0.06;
                    const segmentRadius = baseRadius * taperFactor;
                    const segmentHeight = baseLength * (1 - j * 0.02); // 末端稍微短一点
                    
                    // 使用胶囊几何体，更自然
                    const segmentGeometry = new THREE.CapsuleGeometry(
                        segmentRadius * 0.9,
                        segmentHeight,
                        6,
                        10
                    );
                    
                    const segment = new THREE.Mesh(segmentGeometry, tentacleMaterial);
                    
                    // 计算每段的位置和初始角度
                    // 触手从身体向外，然后向下
                    const angleFromBody = Math.PI / 4; // 从身体向外倾斜
                    
                    segmentGroup.add(segment);
                    
                    // 添加吸盘（在更多位置）
                    if (j >= 2 && j < segments - 1) {
                        const suckerGeometry = new THREE.SphereGeometry(segmentRadius * 0.35, 10, 10);
                        const suckerMaterial = new THREE.MeshPhongMaterial({
                            color: suckerColor,
                            shininess: 50
                        });
                        const sucker = new THREE.Mesh(suckerGeometry, suckerMaterial);
                        
                        // 吸盘在触手下方
                        sucker.position.set(0, -segmentHeight / 2, segmentRadius * 1.1);
                        sucker.scale.set(0.6, 0.35, 0.6);
                        
                        segmentGroup.add(sucker);
                        tentacleGroup.userData.suckers.push({
                            mesh: sucker,
                            segmentIndex: j
                        });
                    }
                    
                    // 计算每段的初始位置
                    // 每段应该在前一段的末端
                    segmentGroup.position.y = -j * segmentHeight;
                    
                    tentacleGroup.add(segmentGroup);
                    tentacleGroup.userData.segments.push({
                        mesh: segmentGroup,
                        index: j,
                        baseHeight: segmentHeight
                    });
                }
                
                // 放置触手 - 围绕身体底部均匀分布
                const angle = (i / 8) * Math.PI * 2;
                const dist = 0.6;
                
                tentacleGroup.position.set(
                    Math.cos(angle) * dist,
                    -0.6,
                    Math.sin(angle) * dist
                );
                
                // 初始旋转：向外向下
                tentacleGroup.rotation.x = Math.PI / 2.5;
                tentacleGroup.rotation.z = angle;
                
                // 保存动画数据
                tentacleGroup.userData = Object.assign(tentacleGroup.userData, {
                    waveOffset: Math.random() * Math.PI * 2,
                    waveSpeed: 0.02 + Math.random() * 0.015,
                    baseAngle: angle,
                    baseRotationX: tentacleGroup.rotation.x,
                    baseRotationZ: tentacleGroup.rotation.z
                });
                
                group.add(tentacleGroup);
                this.tentacles.push(tentacleGroup);
            }
            
            // 眼睛 - 章鱼的大眼睛
            const eyeMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 100
            });
            
            const pupilMaterial = new THREE.MeshPhongMaterial({
                color: 0x000000,
                shininess: 80
            });
            
            // 左眼
            const leftEyeGroup = new THREE.Group();
            const leftEyeGeometry = new THREE.SphereGeometry(0.18, 12, 12);
            const leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
            leftEyeGroup.add(leftEye);
            
            const leftPupilGeometry = new THREE.SphereGeometry(0.1, 10, 10);
            const leftPupil = new THREE.Mesh(leftPupilGeometry, pupilMaterial);
            leftPupil.position.set(0.08, 0, 0.12);
            leftEyeGroup.add(leftPupil);
            
            leftEyeGroup.position.set(0.3, 0.5, 0.4);
            group.add(leftEyeGroup);
            this.leftEye = leftEyeGroup;
            this.originalEyeScale = leftEyeGroup.scale.clone();
            
            // 右眼
            const rightEyeGroup = new THREE.Group();
            const rightEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
            rightEyeGroup.add(rightEye);
            
            const rightPupil = new THREE.Mesh(leftPupilGeometry, pupilMaterial);
            rightPupil.position.set(0.08, 0, -0.12);
            rightEyeGroup.add(rightPupil);
            
            rightEyeGroup.position.set(0.3, 0.5, -0.4);
            group.add(rightEyeGroup);
            this.rightEye = rightEyeGroup;
            
            // 嘴巴
            const mouthGeometry = new THREE.SphereGeometry(0.12, 10, 10);
            const mouthMaterial = new THREE.MeshPhongMaterial({
                color: 0x2f2f2f,
                shininess: 30
            });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(0.6, 0.1, 0);
            mouth.scale.set(1.5, 0.5, 1);
            group.add(mouth);
            this.mouth = mouth;
            this.originalMouthScale = mouth.scale.clone();
        }

        createSeahorse(group) {
            // 海马颜色：金色或棕色
            const bodyColor = 0xffd700; // 金色
            const finColor = 0xffa500; // 橙色
            
            // 海马身体 - 弯曲形状
            const bodyGroup = new THREE.Group();
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: bodyColor,
                shininess: 80,
                specular: 0xffffff
            });
            
            // 身体由多个段组成，形成弯曲形状
            const segments = 10;
            const baseRadius = 0.12;
            
            for (let i = 0; i < segments; i++) {
                const progress = i / segments;
                const radius = baseRadius * (1 - progress * 0.3);
                const segmentGeometry = new THREE.CylinderGeometry(radius * 0.9, radius, 0.35, 10);
                const segment = new THREE.Mesh(segmentGeometry, bodyMaterial);
                
                // 计算弯曲位置
                const angle = progress * Math.PI * 0.7; // 弯曲角度
                const dist = progress * 2.5;
                
                segment.position.set(
                    Math.sin(angle) * dist * 0.3,
                    Math.cos(angle) * dist * 0.3 + 0.5,
                    0
                );
                segment.rotation.z = -angle;
                
                // 添加骨环装饰
                const ringGeometry = new THREE.TorusGeometry(radius * 1.05, 0.02, 8, 12);
                const ringMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffec8b,
                    shininess: 100
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.position.copy(segment.position);
                ring.rotation.x = Math.PI / 2;
                ring.rotation.z = segment.rotation.z;
                
                bodyGroup.add(segment);
                bodyGroup.add(ring);
            }
            
            group.add(bodyGroup);
            this.body = bodyGroup;
            
            // 头部
            const headGroup = new THREE.Group();
            
            // 头部主体
            const headGeometry = new THREE.SphereGeometry(0.25, 12, 12);
            const headMaterial = new THREE.MeshPhongMaterial({
                color: bodyColor,
                shininess: 80
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(1.2, 1.2, 0);
            head.scale.set(1.3, 1, 1);
            headGroup.add(head);
            
            // 长鼻子
            const noseGeometry = new THREE.CylinderGeometry(0.04, 0.08, 0.6, 10);
            const nose = new THREE.Mesh(noseGeometry, headMaterial);
            nose.position.set(1.5, 1.0, 0);
            nose.rotation.z = Math.PI / 3;
            headGroup.add(nose);
            
            // 冠状突起
            const crownGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const crownMaterial = new THREE.MeshPhongMaterial({
                color: 0xffeb3b,
                shininess: 100
            });
            
            for (let i = 0; i < 5; i++) {
                const crown = new THREE.Mesh(crownGeometry, crownMaterial);
                const angle = (i / 5) * Math.PI - Math.PI / 2;
                crown.position.set(
                    1.2 + Math.cos(angle) * 0.25,
                    1.3 + Math.sin(angle) * 0.25 + 0.2,
                    0
                );
                crown.scale.set(0.6, 1.2, 0.6);
                headGroup.add(crown);
            }
            
            group.add(headGroup);
            
            // 眼睛
            const eyeMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 100
            });
            
            const pupilMaterial = new THREE.MeshPhongMaterial({
                color: 0x000000,
                shininess: 80
            });
            
            // 左眼
            const leftEyeGroup = new THREE.Group();
            const leftEyeGeometry = new THREE.SphereGeometry(0.08, 10, 10);
            const leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
            leftEyeGroup.add(leftEye);
            
            const leftPupilGeometry = new THREE.SphereGeometry(0.04, 8, 8);
            const leftPupil = new THREE.Mesh(leftPupilGeometry, pupilMaterial);
            leftPupil.position.set(0.04, 0, 0.06);
            leftEyeGroup.add(leftPupil);
            
            leftEyeGroup.position.set(1.3, 1.35, 0.18);
            group.add(leftEyeGroup);
            this.leftEye = leftEyeGroup;
            this.originalEyeScale = leftEyeGroup.scale.clone();
            
            // 右眼
            const rightEyeGroup = new THREE.Group();
            const rightEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
            rightEyeGroup.add(rightEye);
            
            const rightPupil = new THREE.Mesh(leftPupilGeometry, pupilMaterial);
            rightPupil.position.set(0.04, 0, -0.06);
            rightEyeGroup.add(rightPupil);
            
            rightEyeGroup.position.set(1.3, 1.35, -0.18);
            group.add(rightEyeGroup);
            this.rightEye = rightEyeGroup;
            
            // 嘴巴
            const mouthGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const mouthMaterial = new THREE.MeshPhongMaterial({
                color: 0x2f2f2f,
                shininess: 30
            });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(1.5, 1.1, 0);
            mouth.scale.set(1.5, 0.6, 1);
            group.add(mouth);
            this.mouth = mouth;
            this.originalMouthScale = mouth.scale.clone();
            
            // 背鳍
            const dorsalFinGroup = new THREE.Group();
            
            const dorsalFinGeometry = new THREE.ConeGeometry(0.15, 0.5, 4);
            const finMaterial = new THREE.MeshPhongMaterial({
                color: finColor,
                shininess: 60,
                side: THREE.DoubleSide
            });
            
            const dorsalFin = new THREE.Mesh(dorsalFinGeometry, finMaterial);
            dorsalFin.position.set(0.5, 0.8, 0);
            dorsalFin.rotation.x = -Math.PI / 6;
            dorsalFinGroup.add(dorsalFin);
            
            group.add(dorsalFinGroup);
            this.dorsalFin = dorsalFinGroup;
            
            // 胸鳍
            const pectoralFinGeometry = new THREE.ConeGeometry(0.12, 0.4, 4);
            
            const leftPectoralFin = new THREE.Mesh(pectoralFinGeometry, finMaterial);
            leftPectoralFin.position.set(0.8, 0.6, 0.25);
            leftPectoralFin.rotation.x = Math.PI / 3;
            group.add(leftPectoralFin);
            this.leftPectoralFin = leftPectoralFin;
            
            const rightPectoralFin = new THREE.Mesh(pectoralFinGeometry, finMaterial);
            rightPectoralFin.position.set(0.8, 0.6, -0.25);
            rightPectoralFin.rotation.x = -Math.PI / 3;
            group.add(rightPectoralFin);
            this.rightPectoralFin = rightPectoralFin;
        }

        swim(deltaTime) {
            this.time += deltaTime;
            
            if (this.isScared) {
                // 受惊状态
                this.scaredTime -= deltaTime;
                if (this.scaredTime <= 0) {
                    this.isScared = false;
                    // 恢复正常大小和表情
                    if (this.leftEye && this.originalEyeScale) {
                        this.leftEye.scale.copy(this.originalEyeScale);
                    }
                    if (this.rightEye && this.originalEyeScale) {
                        this.rightEye.scale.copy(this.originalEyeScale);
                    }
                    if (this.mouth && this.originalMouthScale) {
                        this.mouth.scale.copy(this.originalMouthScale);
                    }
                }
            } else {
                // 正常游动 - 随机改变方向
                if (Math.random() < 0.005) {
                    this.targetRotation = Math.random() * Math.PI * 2;
                }
            }
            
            // 边界检测 - 确保鱼不会游出可视区域，而是从另一边进来
            const speed = this.isScared ? this.baseSpeed * this.scaredSpeedMultiplier : this.baseSpeed;
            
            // 平滑旋转
            let rotationDiff = this.targetRotation - this.currentRotation;
            
            // 处理角度环绕
            while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
            while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
            
            this.currentRotation += rotationDiff * this.turnSpeed;
            
            // 设置速度
            this.velocity.x = Math.cos(this.currentRotation) * speed;
            this.velocity.z = Math.sin(this.currentRotation) * speed;
            this.velocity.y = Math.sin(this.time * 1.5) * 0.003;
            
            // 更新位置
            this.position.add(this.velocity);
            
            // 边界环绕 - 鱼永远不会离开场景
            if (this.position.x > BOUNDS.maxX + 2) {
                this.position.x = BOUNDS.minX - 1;
            } else if (this.position.x < BOUNDS.minX - 2) {
                this.position.x = BOUNDS.maxX + 1;
            }
            
            if (this.position.y > BOUNDS.maxY + 2) {
                this.position.y = BOUNDS.minY - 1;
            } else if (this.position.y < BOUNDS.minY - 2) {
                this.position.y = BOUNDS.maxY + 1;
            }
            
            if (this.position.z > BOUNDS.maxZ + 2) {
                this.position.z = BOUNDS.minZ - 1;
            } else if (this.position.z < BOUNDS.minZ - 2) {
                this.position.z = BOUNDS.maxZ + 1;
            }
            
            // 更新模型位置和旋转
            if (this.mesh) {
                this.mesh.position.copy(this.position);
                this.mesh.rotation.y = this.currentRotation;
                
                // 尾巴摆动动画
                if (this.tail) {
                    const wagAmount = this.isScared ? this.tailWagAmount * 2 : this.tailWagAmount;
                    const wagSpeed = this.isScared ? this.tailWagSpeed * 1.5 : this.tailWagSpeed;
                    this.tail.rotation.z = Math.sin(this.time * wagSpeed) * wagAmount;
                }
                
                // 鱼鳍摆动动画
                if (this.leftPectoralFin) {
                    this.leftPectoralFin.rotation.z = Math.sin(this.time * this.finWagSpeed) * this.finWagAmount;
                }
                if (this.rightPectoralFin) {
                    this.rightPectoralFin.rotation.z = -Math.sin(this.time * this.finWagSpeed) * this.finWagAmount;
                }
                
                // 背鳍摆动
                if (this.dorsalFin) {
                    this.dorsalFin.rotation.z = Math.sin(this.time * this.finWagSpeed * 0.5) * 0.1;
                }
                
                // 身体轻微摆动
                if (this.body) {
                    this.body.rotation.z = Math.sin(this.time * this.tailWagSpeed) * 0.05;
                }
                
                // 章鱼触手摆动 - 更自然的波动
                if (this.tentacles) {
                    this.tentacles.forEach((tentacle, tentacleIndex) => {
                        const segments = tentacle.userData.segments;
                        
                        if (!segments) {
                            // 简单版本（如果是其他类型的触手）
                            const wave = Math.sin(this.time * tentacle.userData.waveSpeed * 8 + tentacle.userData.waveOffset);
                            tentacle.rotation.x = Math.PI / 3 + wave * 0.3;
                            tentacle.children.forEach((segment, index) => {
                                if (segment.isMesh) {
                                    segment.rotation.z = wave * 0.2 * (1 + index * 0.1);
                                }
                            });
                        } else {
                            // 改进的章鱼触手动画
                            // 使用正弦波创建更自然的波动
                            // 每段的动画是连续的波浪运动
                            
                            const baseWave = Math.sin(this.time * tentacle.userData.waveSpeed * 6 + tentacle.userData.waveOffset);
                            
                            // 触手整体轻微摆动
                            tentacle.rotation.x = tentacle.userData.baseRotationX + baseWave * 0.25;
                            tentacle.rotation.z = tentacle.userData.baseRotationZ + baseWave * 0.08;
                            
                            // 每段单独的波动 - 使用链式运动，像蛇一样
                            for (let j = 0; j < segments.length; j++) {
                                const segmentData = segments[j];
                                const segment = segmentData.mesh;
                                
                                // 距离身体越远的段，波动越大
                                const segmentProgress = j / segments.length;
                                
                                // 多重波动频率 - 产生更自然的效果
                                const wave1 = Math.sin(this.time * tentacle.userData.waveSpeed * 7 + tentacle.userData.waveOffset + j * 0.4);
                                const wave2 = Math.sin(this.time * tentacle.userData.waveSpeed * 5 + tentacle.userData.waveOffset * 1.5 + j * 0.6) * 0.5;
                                
                                const totalWave = (wave1 + wave2) * (0.15 + segmentProgress * 0.25);
                                
                                // 每段有两个方向的摆动
                                segment.rotation.x = totalWave * 0.7;
                                segment.rotation.z = totalWave * 0.5;
                                
                                // 轻微的前后摆动（Y轴方向）
                                segment.rotation.y = Math.sin(this.time * tentacle.userData.waveSpeed * 4 + tentacle.userData.waveOffset + j * 0.3) * 0.08;
                            }
                        }
                    });
                }
            }
        }

        scare() {
            if (this.isScared) return;
            
            this.isScared = true;
            this.scaredTime = 4; // 受惊持续时间更长
            
            // 明显的惊讶表情
            // 眼睛突然变大
            if (this.leftEye && this.originalEyeScale) {
                this.leftEye.scale.set(
                    this.originalEyeScale.x * 2.5,
                    this.originalEyeScale.y * 2.5,
                    this.originalEyeScale.z * 2.5
                );
            }
            if (this.rightEye && this.originalEyeScale) {
                this.rightEye.scale.set(
                    this.originalEyeScale.x * 2.5,
                    this.originalEyeScale.y * 2.5,
                    this.originalEyeScale.z * 2.5
                );
            }
            
            // 嘴巴张大
            if (this.mouth && this.originalMouthScale) {
                this.mouth.scale.set(
                    this.originalMouthScale.x * 2,
                    this.originalMouthScale.y * 2.5,
                    this.originalMouthScale.z * 2
                );
            }
            
            // 快速逃离方向 - 朝向反方向
            this.targetRotation = this.currentRotation + Math.PI + (Math.random() - 0.5) * Math.PI;
        }

        update(deltaTime) {
            this.swim(deltaTime);
        }
    }

    // 鱼群管理器
    class FishManager {
        constructor(scene) {
            this.scene = scene;
            this.fishes = [];
            this.raycaster = new THREE.Raycaster();
            this.mouse = new THREE.Vector2();
            this.targetFishCount = 5;
        }

        createFishes(count = 5) {
            this.targetFishCount = count;
            const fishTypes = ['clownfish', 'shark', 'octopus', 'seahorse'];
            
            for (let i = 0; i < count; i++) {
                this.createSingleFish(i);
            }
            
            return this.fishes;
        }

        createSingleFish(index = 0) {
            // 随机位置 - 在可视区域内
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 15,
                Math.random() * 10 + 2,
                (Math.random() - 0.5) * 15
            );
            
            // 随机类型
            const type = index % 4;
            
            const fish = new Fish(this.scene, position, type);
            this.fishes.push(fish);
        }

        checkClick(mousePosition, camera) {
            this.mouse.copy(mousePosition);
            this.raycaster.setFromCamera(this.mouse, camera);
            
            // 收集所有鱼的网格
            const fishMeshes = [];
            this.fishes.forEach(fish => {
                if (fish.mesh) {
                    // 需要检查所有子网格
                    fish.mesh.traverse(child => {
                        if (child.isMesh) {
                            fishMeshes.push({
                                mesh: child,
                                fish: fish
                            });
                        }
                    });
                }
            });
            
            // 检测射线碰撞
            const meshesOnly = fishMeshes.map(item => item.mesh);
            const intersects = this.raycaster.intersectObjects(meshesOnly);
            
            if (intersects.length > 0) {
                // 找到被点击的鱼
                const clickedMesh = intersects[0].object;
                const fishItem = fishMeshes.find(item => item.mesh === clickedMesh);
                
                if (fishItem) {
                    fishItem.fish.scare();
                    return true;
                }
            }
            
            return false;
        }

        update(deltaTime) {
            // 更新所有鱼
            this.fishes.forEach(fish => {
                fish.update(deltaTime);
            });
            
            // 确保始终有足够的鱼
            // 由于使用了边界环绕，鱼不会真正离开场景
            // 但作为额外保障，定期检查并补充鱼
            if (this.fishes.length < this.targetFishCount) {
                this.createSingleFish(this.fishes.length);
            }
        }
    }

    // 暴露到全局
    global.Fish = Fish;
    global.FishManager = FishManager;
    global.BOUNDS = BOUNDS;

})(window);
