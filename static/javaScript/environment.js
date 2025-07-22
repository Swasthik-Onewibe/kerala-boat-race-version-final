import * as THREE from '/static/lib/three.module.js';
import { GLTFLoader } from '/static/lib/GLTFLoader.js';
import { BoatManager } from './boats.js';

export class Environment {
  constructor(scene, config, performanceMode) {
    this.scene = scene;
    this.config = config;
    this.performanceMode = performanceMode;
    this.riverChunks = [];
    this.waveTime = 0;
    this.water = null;
    this.waveMesh = null;
    
    // Performance optimization flags
    this.enableShadows = false; // Disable most shadows for better performance
    this.maxTrees = 6; // Reduce tree count significantly
    this.maxGrassPatches = 8; // Reduce grass patches
    this.loader = new GLTFLoader();

  }

  init() {
    this.createOptimizedWater();
    this.createOptimizedRiverBanks();
    this.createFinishLine();
    this.addOptimizedWaterOverlay();
  }

  createOptimizedWater() {
    // Reduced chunk count and simpler geometry for better performance
    const chunkCount = this.performanceMode === 'high' ? 3 : 2; // Reduced from 10 to 3
    const subdivisions = this.performanceMode === 'high' ? 4 : 2;
    const chunkLength = this.config.WATER_LENGTH || this.config.RIVER_LENGTH;
    
    // Use simple plane geometry instead of complex models
    const waterGeometry = new THREE.PlaneGeometry(
      this.config.WATER_WIDTH || 50, 
      chunkLength, subdivisions, subdivisions,
    );
    
    const waterMaterial = new THREE.MeshLambertMaterial({
      color: 0x4A90E2,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    this.riverChunks = [];

    for (let i = 0; i < chunkCount; i++) {
      const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
      waterMesh.rotation.x = -Math.PI / 2;
      waterMesh.position.set(0, -0.5, -chunkLength * i);
      waterMesh.receiveShadow = false; // Disable shadows for performance
      
      this.scene.add(waterMesh);
      this.riverChunks.push(waterMesh);

      if (i === 0) {
        this.water = waterMesh; // First chunk for minimal animation
      }
    }
  }

  createOptimizedRiverBanks() {
    const loader = new GLTFLoader(); 
    const riverWidth = this.config.WATER_WIDTH || this.config.RIVER_WIDTH || 50;
    const bankWidth = this.config.BANK_WIDTH || 30;
    const riverLength = this.config.WATER_LENGTH || this.config.RIVER_LENGTH || 200;

    // Check if GLTFLoader is available and models are configured
    if (typeof loader !== 'undefined' && this.config.MODELS?.GROUND_GRASS) {
      this.loadOptimizedGrass(riverWidth, bankWidth, riverLength);
    }
    
    // Always load trees but with heavy optimization
    this.loadOptimizedTrees(riverWidth, bankWidth, riverLength);
  }

  loadOptimizedGrass(riverWidth, bankWidth, riverLength) {
    const loader = new GLTFLoader(); 
    
    loader.load(
      this.config.MODELS.GROUND_GRASS,
      (gltf) => {
        const grassModel = gltf.scene;
        
        // Minimal grass configuration
        grassModel.traverse((child) => {
          if (child.isMesh) {
            child.receiveShadow = false; // No shadows
            child.castShadow = false;   // No shadows
            
            // Use cheaper materials
            if (child.material) {
              child.material = new THREE.MeshBasicMaterial({
                color: child.material.color || 0x228B22,
                transparent: false
              });
            }
          }
        });

        // Drastically reduce grass patches
        const grassSpacing = 40; // Increased spacing
        const patchesPerSide = 3; // Only 3 patches per side
        
        for (let i = 0; i < patchesPerSide; i++) {
          const zPos = (i - 1) * grassSpacing; // Centered around origin
          
          // Left bank - minimal patches
          const leftPatch = grassModel.clone();
          leftPatch.position.set(
            -(riverWidth / 2 + bankWidth * 0.6),
            -1, 
            zPos
          );
          leftPatch.scale.set(0.8, 0.3, 0.8); // Smaller scale
          this.scene.add(leftPatch);
          
          // Right bank - minimal patches  
          const rightPatch = grassModel.clone();
          rightPatch.position.set(
            riverWidth / 2 + bankWidth * 0.3,
            -1, 
            zPos
          );
          rightPatch.scale.set(0.8, 0.3, 0.8); // Smaller scale
          this.scene.add(rightPatch);
        }
      },
      undefined,
      (error) => {
        console.warn('Could not load grass model (performance optimized):', error);
      }
    );
  }

  loadOptimizedTrees(riverWidth, bankWidth, riverLength) {
    const loader = new GLTFLoader(); // ✅


    const palmtreePath = this.config.MODELS?.PALM_TREES;
    const oakTreePath = this.config.MODELS?.OAK_TREES;

    if (!palmtreePath && !oakTreePath) {
      console.warn('Tree models not configured');
      return;
    }

    // Heavily optimized tree placing - only 2-3 trees per side
    const placeMinimalTrees = (treeModel, xPos, count = 2) => {
      for (let i = 0; i < count; i++) {
        const tree = treeModel.clone();
        const z = (i - 0.5) * 60; // Wide spacing
        tree.position.set(xPos, 0, z);
        tree.scale.set(2, 2, 2); // Reasonable scale
        tree.castShadow = false; // No shadows for performance
        tree.receiveShadow = false;
        
        // Optimize tree materials for performance
        tree.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material = new THREE.MeshLambertMaterial({
              color: child.material.color || 0x228B22,
              transparent: false
            });
          }
        });
        
        this.scene.add(tree);
      }
    };

    // Load palm trees with heavy optimization
    if (palmtreePath) {
      loader.load(palmtreePath, (gltf) => {
        const palmModel = gltf.scene;
        
        // Left side - only 2 palms
        placeMinimalTrees(palmModel, -riverWidth / 2 - 25, 2);
        // Right side - only 2 palms  
        placeMinimalTrees(palmModel, riverWidth / 2 + 25, 2);
        
        console.log('✓ Optimized palm trees loaded (4 total)');
      }, undefined, (error) => {
        console.warn('Could not load palm trees:', error);
      });
    }

    // Load oak trees with heavy optimization
    if (oakTreePath) {
      loader.load(oakTreePath, (gltf) => {
        const oakModel = gltf.scene;
        
        // Even fewer oak trees, smaller scale
        const placeSmallOaks = (xPos) => {
          const oak = oakModel.clone();
          oak.position.set(xPos, 0, 0); // Only one oak per side
          oak.scale.set(0.3, 0.15, 0.3); // Very small
          oak.castShadow = false;
          oak.receiveShadow = false;
          
          oak.traverse((child) => {
            if (child.isMesh && child.material) {
              child.material = new THREE.MeshLambertMaterial({
                color: child.material.color || 0x8B4513,
                transparent: false
              });
            }
          });
          
          this.scene.add(oak);
        };
        
        placeSmallOaks(-riverWidth / 2 - 15);
        placeSmallOaks(riverWidth / 2 + 15);
        
        console.log('✓ Optimized oak trees loaded (2 total)');
      }, undefined, (error) => {
        console.warn('Could not load oak trees:', error);
      });
    }
  }

  createFinishLine() {
    const finishGroup = new THREE.Group();
    const finishZ = this.config.FINISH_LINE_Z || 100;

    // Simplified posts with no shadows
    const postGeometry = new THREE.CylinderGeometry(0.8, 0.8, 12);
    const postMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x8B4513,
      transparent: false 
    });
    
    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(-18, 8, finishZ);
    leftPost.castShadow = false; // No shadows
    finishGroup.add(leftPost);

    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(20, 8, finishZ);
    rightPost.castShadow = false; // No shadows
    finishGroup.add(rightPost);

    // Simplified banner
    const bannerGeometry = new THREE.PlaneGeometry(40, 5);
    const bannerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: false
    });
    const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
    banner.position.set(0, 5, finishZ);
    finishGroup.add(banner);

    this.scene.add(finishGroup);
  }

  addOptimizedWaterOverlay() {
    // Skip texture loading for better performance
    // Create simple animated water effect instead
    
    const waveGeometry = new THREE.PlaneGeometry(150, 150, 2, 2); // Very low poly
    const waveMaterial = new THREE.MeshBasicMaterial({
      color: 0x4A90E2,
      transparent: true,
      opacity: 0.1,
      depthWrite: false
    });

    this.waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
    this.waveMesh.rotation.x = -Math.PI / 2;
    this.waveMesh.position.y = 0.01;
    this.waveMesh.renderOrder = 1;
    this.scene.add(this.waveMesh);
  }

  update() {
    // Heavily optimized update - only run every few frames
    if (this.waveTime % 5 !== 0) {
      this.waveTime += 1;
      return;
    }
    
    this.waveTime += 1;

    // Minimal water animation - only if water exists and every 5 frames
    if (this.water && this.water.geometry && this.waveTime % 10 === 0) {
      const time = this.waveTime * 0.002; // Slower animation
      const vertices = this.water.geometry.attributes.position.array;
      
      // Simplified single wave pattern
      for (let i = 0; i < vertices.length; i += 9) { // Skip vertices for performance
        const x = vertices[i];
        const wave = Math.sin(x * 0.05 + time) * 0.2; // Smaller waves
        vertices[i + 2] = wave;
      }
      this.water.geometry.attributes.position.needsUpdate = true;
    }

    // Remove complex environmental animations for performance
  }
}

