import * as THREE from '/static/lib/three.module.js';
import { GLTFLoader } from '/static/lib/GLTFLoader.js';

window.KeralaBRace = window.KeralaBRace || {};

// Highly Optimized Boat Manager class with aggressive performance improvements
export class BoatManager {
  constructor(scene, performanceMode) {
    this.scene = scene;
    this.performanceMode = performanceMode; 
    this.boats = [];
    this.loader = new GLTFLoader();
    this.waveTime = 0;
    
    // Performance optimization: Store original models for instancing
    this.originalBoatModel = null;
    this.loadingPromises = new Map();
    
    // Performance caches
    this.sinCache = new Map();
    this.cosCache = new Map();
    this.frameSkipCounter = 0;
    this.animationFrame = 0;
    
    // Material sharing for better performance
    this.sharedMaterials = new Map();
    this.sharedGeometries = new Map();
  }

  /**
   * Create boats with highly optimized loading and instancing
   */
  async createBoats() {
    const config = window.KeralaBRace.CONFIG;
    
    return new Promise(async (resolve) => {
      
      try {
        // Load the boat model once and reuse it
        await this.loadOriginalBoatModel();
        
        // Create instances instead of clones
        this.createBoatInstances();
        
        resolve();
      } catch (error) {
        console.warn('Failed to load boat models, using fallback:', error);
        this.createFallbackBoats();
        resolve();
      }
    });
  }

  /**
   * Load the original boat model once with aggressive optimization
   */
  async loadOriginalBoatModel() {
    const config = window.KeralaBRace.CONFIG;
    
    return new Promise((resolve, reject) => {
      this.loader.load(
        config.MODELS.SNAKE_BOAT,
        (gltf) => {
          this.originalBoatModel = gltf.scene;
          
          // Aggressively optimize the original model
          this.aggressiveOptimizeModel(this.originalBoatModel);
          
          console.log('✓ Original boat model loaded and aggressively optimized');
          resolve();
        },
        (progress) => {
          // Reduce loading progress updates for better performance
          if (this.frameSkipCounter % 10 === 0) {
            this.updateLoadingProgress('boat model', progress);
          }
          this.frameSkipCounter++;
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Aggressively optimize a 3D model for maximum performance
   */
  aggressiveOptimizeModel(model) {
    const materials = new Map();
    let meshCount = 0;
    
    model.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        
        // DISABLE SHADOWS COMPLETELY for better performance
        child.castShadow = false;
        child.receiveShadow = false;
        
        // Aggressive material optimization
        if (child.material) {
          const materialKey = this.getMaterialKey(child.material);
          
          if (materials.has(materialKey)) {
            child.material = materials.get(materialKey);
          } else {
            // Aggressively optimize the material
            const optimizedMaterial = this.aggressiveOptimizeMaterial(child.material);
            materials.set(materialKey, optimizedMaterial);
            child.material = optimizedMaterial;
          }
        }

        // Aggressive geometry optimization
        if (child.geometry) {
          // Merge vertices to reduce complexity if possible
          if (child.geometry.attributes && child.geometry.attributes.position) {
            child.geometry.computeBoundingSphere();
            child.geometry.computeBoundingBox();
            
            // Reduce geometry complexity for distant objects
            if (meshCount > 10) {
              this.simplifyGeometry(child.geometry);
            }
          }
        }
        
        // Disable frustum culling for very small objects to reduce calculations
        if (child.geometry && child.geometry.boundingSphere && 
            child.geometry.boundingSphere.radius < 0.1) {
          child.frustumCulled = false;
        }
      }
    });

    console.log(`✓ Model optimized: ${meshCount} meshes processed`);
  }

  /**
   * Simplify geometry for better performance
   */
  simplifyGeometry(geometry) {
    // For very complex models, we can reduce vertex count
    if (geometry.attributes.position && geometry.attributes.position.count > 1000) {
      // This is a placeholder for geometry simplification
      // In a real implementation, you might use a decimation algorithm
      geometry.setDrawRange(0, Math.min(geometry.attributes.position.count, 500));
    }
  }

  /**
   * Aggressively optimize material properties
   */
  aggressiveOptimizeMaterial(material) {
    // Use the most performance-friendly material type
    let optimized;
    
    if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
      // Convert expensive materials to basic materials
      optimized = new THREE.MeshLambertMaterial({
        color: material.color || 0x888888,
        transparent: material.transparent && material.opacity < 0.99,
        opacity: material.opacity || 1.0
      });
    } else {
      optimized = material.clone();
    }
    
    // Disable all expensive features
    optimized.shininess = 0;
    optimized.reflectivity = 0;
    
    // Ensure no transparency unless absolutely necessary
    if (optimized.transparent && optimized.opacity >= 0.98) {
      optimized.transparent = false;
      optimized.opacity = 1.0;
    }
    
    // Disable texture filtering for better performance if textures exist
    if (optimized.map) {
      optimized.map.minFilter = THREE.LinearFilter;
      optimized.map.magFilter = THREE.LinearFilter;
      optimized.map.generateMipmaps = false;
    }
    
    return optimized;
  }

  /**
   * Create boat instances with minimal overhead
   */
  createBoatInstances() {
    const config = window.KeralaBRace.CONFIG;
    
    if (!this.originalBoatModel) {
      this.createFallbackBoats();
      return;
    }



    // Create boat instances with shared materials and geometries
    const boat1 = this.createOptimizedBoatInstance(0, config.BOAT_1_X);
    this.boats[0] = boat1;
    
    const boat2 = this.createOptimizedBoatInstance(1, config.BOAT_2_X);
    this.boats[1] = boat2;
  }

  getMaterialKey(material) {
  // Create a simple unique key based on material properties (you can expand this as needed)
  return `${material.type}_${material.color?.getHexString?.() ?? 'default'}_${material.transparent}_${material.opacity}`;
}

  /**
   * Create a highly optimized boat instance
   */
  createOptimizedBoatInstance(index, xPosition) {
    const config = window.KeralaBRace.CONFIG;
    
    // Use the most efficient cloning method
    const boat = this.ultraEfficientClone(this.originalBoatModel);
    
    // Setup boat properties with direct assignment
    const scale = config.BOAT_SCALE;
    boat.scale.x = scale;
    boat.scale.y = scale;
    boat.scale.z = scale;
    
    boat.rotation.y = Math.PI; // Face forward
    
    boat.position.x = xPosition;
    boat.position.y = config.BOAT_BASE_Y;
    boat.position.z = config.START_POSITION_Z;
    
    // Disable matrix auto-update for static properties
    boat.matrixAutoUpdate = true; // Keep true only for moving objects
    
    // Add boat to scene
    this.scene.add(boat);
    
    console.log(`✓ Optimized boat ${index + 1} instance created`);
    return boat;
  }

  /**
   * Ultra efficient cloning method with maximum resource sharing
   */
  ultraEfficientClone(object) {
    const clone = new THREE.Group();
    
    object.traverse((child) => {
      if (child.isMesh) {
        const clonedMesh = new THREE.Mesh(
          child.geometry, // Reuse geometry completely
          child.material  // Reuse material completely
        );
        
        // Copy only essential transform properties
        clonedMesh.position.copy(child.position);
        clonedMesh.rotation.copy(child.rotation);
        clonedMesh.scale.copy(child.scale);
        
        // No shadows for performance
        clonedMesh.castShadow = false;
        clonedMesh.receiveShadow = false;
        
        // Disable frustum culling for small objects
        if (child.geometry.boundingSphere && child.geometry.boundingSphere.radius < 0.2) {
          clonedMesh.frustumCulled = false;
        }
        
        clone.add(clonedMesh);
      }
    });
    
    return clone;
  }

  /**
   * Create highly optimized fallback boats
   */
  createFallbackBoats() {
    const config = window.KeralaBRace.CONFIG;
    
    // Create shared geometries ONCE
    if (!this.sharedGeometries.has('hull')) {
      this.sharedGeometries.set('hull', new THREE.BoxGeometry(2, 0.5, 8));
      this.sharedGeometries.set('bow', new THREE.ConeGeometry(0.3, 1, 6)); // Reduced segments
    }
    
    // Create shared materials ONCE
    this.createSharedMaterials();
    
    this.createUltraOptimizedFallbackBoat(0, config.BOAT_1_X);
    this.createUltraOptimizedFallbackBoat(1, config.BOAT_2_X);
  }

  /**
   * Create shared materials for maximum reuse
   */
  createSharedMaterials() {
    const colors = window.KeralaBRace.COLORS;
    
    if (!this.sharedMaterials.has('boat1')) {
      this.sharedMaterials.set('boat1', new THREE.MeshBasicMaterial({ // Use Basic instead of Lambert
        color: colors.BOAT_1
      }));
      
      this.sharedMaterials.set('boat2', new THREE.MeshBasicMaterial({
        color: colors.BOAT_2
      }));
      
      this.sharedMaterials.set('white', new THREE.MeshBasicMaterial({
        color: colors.WHITE
      }));
    }
  }

  /**
   * Create ultra-optimized fallback boat
   */
  createUltraOptimizedFallbackBoat(index, xPosition) {
    const config = window.KeralaBRace.CONFIG;
    
    const boat = new THREE.Group();
    
    // Main hull - reuse everything
    const hullMaterial = this.sharedMaterials.get(index === 0 ? 'boat1' : 'boat2');
    const hull = new THREE.Mesh(this.sharedGeometries.get('hull'), hullMaterial);
    hull.position.y = 0.25;
    hull.castShadow = false; // NO SHADOWS
    hull.receiveShadow = false;
    hull.frustumCulled = false; // Skip frustum culling calculations
    boat.add(hull);

    // Bow decoration - shared geometry and material
    const bow = new THREE.Mesh(
      this.sharedGeometries.get('bow'), 
      this.sharedMaterials.get('white')
    );
    bow.position.set(0, 0.75, 3.5);
    bow.rotation.x = Math.PI / 2;
    bow.castShadow = false; // NO SHADOWS
    bow.receiveShadow = false;
    bow.frustumCulled = false;
    boat.add(bow);

    // Position the boat
    boat.position.set(xPosition, config.BOAT_BASE_Y, config.START_POSITION_Z);
    
    this.scene.add(boat);
    this.boats[index] = boat;
  }

  /**
   * Highly optimized boat movement with aggressive frame skipping
   */
  moveBoat(index, isMoving) {
    const config = window.KeralaBRace.CONFIG;
    const boat = this.boats[index];
    
    if (!boat || !isMoving) return;

    boat.position.z += config.BOAT_SPEED;
    
    // Aggressive animation frame skipping - only animate every 4th frame
    this.animationFrame++;
    if (this.animationFrame % 4 === 0) {
      this.animateBoatCached(boat, index);
    }
  }

  /**
   * Cached boat animation with pre-calculated values
   */
  animateBoatCached(boat, index) {
    const config = window.KeralaBRace.CONFIG;
    const offset = index * 1.57; // Pre-calculated Math.PI / 2
    const time = this.waveTime * config.WAVE_FREQUENCY + offset;
    
    // Use cached trigonometric values
    const timeKey = Math.floor(time * 10); // Reduce precision for caching
    
    let sinTime, cosTime;
    if (this.sinCache.has(timeKey)) {
      sinTime = this.sinCache.get(timeKey);
      cosTime = this.cosCache.get(timeKey);
    } else {
      sinTime = Math.sin(time);
      cosTime = Math.cos(time);
      
      // Cache values but limit cache size
      if (this.sinCache.size > 100) {
        this.sinCache.clear();
        this.cosCache.clear();
      }
      
      this.sinCache.set(timeKey, sinTime);
      this.cosCache.set(timeKey, cosTime);
    }
    
    // Minimal animation - only essential movements
    boat.position.y = config.BOAT_BASE_Y + sinTime * config.WAVE_AMPLITUDE * 0.5; // Reduced amplitude
    
    // Very minimal rotation to save performance
    if (this.animationFrame % 8 === 0) { // Even less frequent rotation updates
      boat.rotation.x = sinTime * 0.02; // Much smaller rotation
      boat.rotation.z = cosTime * 0.03;
    }
  }

  /**
   * Update wave time with reduced frequency
   */
  updateWaveTime() {
    this.waveTime += 0.5; // Slower wave updates
  }

  /**
   * Ultra-fast boat reset
   */
  resetBoats() {
    const config = window.KeralaBRace.CONFIG;
    
    // Reset with minimal calculations
    const boat1 = this.boats[0];
    if (boat1) {
      boat1.position.x = config.BOAT_1_X;
      boat1.position.y = config.BOAT_BASE_Y;
      boat1.position.z = config.START_POSITION_Z;
      boat1.rotation.x = 0;
      boat1.rotation.y = Math.PI;
      boat1.rotation.z = 0;
    }
    
    const boat2 = this.boats[1];
    if (boat2) {
      boat2.position.x = config.BOAT_2_X;
      boat2.position.y = config.BOAT_BASE_Y;
      boat2.position.z = config.START_POSITION_Z;
      boat2.rotation.x = 0;
      boat2.rotation.y = Math.PI;
      boat2.rotation.z = 0;
    }
  }

  /**
   * Get boat by index
   */
  getBoat(index) {
    return this.boats[index];
  }

  /**
   * Get all boats
   */
  getBoats() {
    return this.boats;
  }

  /**
   * Optimized loading progress with reduced updates
   */
  updateLoadingProgress(itemName, progress) {
    if (progress.total > 0) {
      const percent = Math.round((progress.loaded / progress.total) * 100);
      const progressElement = document.getElementById('loadingProgress');
      if (progressElement) {
        progressElement.textContent = `Loading ${itemName}: ${percent}%`;
      }
    }
  }

  /**
   * Comprehensive cleanup method
   */
  dispose() {
    // Clear caches
    this.sinCache.clear();
    this.cosCache.clear();
    
    // Dispose of shared geometries
    this.sharedGeometries.forEach(geometry => {
      geometry.dispose();
    });
    this.sharedGeometries.clear();

    // Dispose of shared materials
    this.sharedMaterials.forEach(material => {
      material.dispose();
    });
    this.sharedMaterials.clear();

    // Remove boats from scene
    this.boats.forEach(boat => {
      if (boat) {
        this.scene.remove(boat);
        // Traverse and dispose of geometries and materials
        boat.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    });

    this.boats = [];
    this.originalBoatModel = null;
  }
};
