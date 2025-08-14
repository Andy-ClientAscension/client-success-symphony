import React from 'react';

/**
 * Performance Profiler
 * Comprehensive performance analysis and monitoring utilities
 */

export interface PerformanceBenchmark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
  largestModules: Array<{
    name: string;
    size: number;
  }>;
}

export interface RenderProfileData {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  totalRenderTime: number;
  propsChanges: number;
}

class PerformanceProfiler {
  private benchmarks: Map<string, PerformanceBenchmark> = new Map();
  private renderProfiles: Map<string, RenderProfileData> = new Map();
  private queryMetrics: Map<string, any> = new Map();

  // Benchmark specific operations
  startBenchmark(name: string, metadata?: Record<string, any>): void {
    this.benchmarks.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  endBenchmark(name: string): number | null {
    const benchmark = this.benchmarks.get(name);
    if (!benchmark) {
      console.warn(`Benchmark '${name}' not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - benchmark.startTime;
    
    benchmark.endTime = endTime;
    benchmark.duration = duration;

    if (import.meta.env.DEV) {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Component render profiling
  profileRender(componentName: string, renderTime: number, propsChanged: boolean = false): void {
    const existing = this.renderProfiles.get(componentName) || {
      componentName,
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      totalRenderTime: 0,
      propsChanges: 0,
    };

    existing.renderCount++;
    existing.lastRenderTime = renderTime;
    existing.totalRenderTime += renderTime;
    existing.averageRenderTime = existing.totalRenderTime / existing.renderCount;
    
    if (propsChanged) {
      existing.propsChanges++;
    }

    this.renderProfiles.set(componentName, existing);

    // Warn about potential performance issues
    if (renderTime > 16) { // More than one frame at 60fps
      console.warn(`🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }

    if (existing.renderCount > 10 && existing.propsChanges / existing.renderCount < 0.3) {
      console.warn(`🔄 Potential unnecessary re-renders: ${componentName} (${existing.renderCount} renders, ${existing.propsChanges} prop changes)`);
    }
  }

  // Query performance tracking
  trackQuery(queryKey: string, duration: number, cacheHit: boolean, dataSize?: number): void {
    const existing = this.queryMetrics.get(queryKey) || {
      totalCalls: 0,
      totalDuration: 0,
      cacheHits: 0,
      averageDuration: 0,
      lastCall: 0,
      dataSize: 0,
    };

    existing.totalCalls++;
    existing.totalDuration += duration;
    existing.averageDuration = existing.totalDuration / existing.totalCalls;
    existing.lastCall = Date.now();
    
    if (cacheHit) {
      existing.cacheHits++;
    }
    
    if (dataSize) {
      existing.dataSize = dataSize;
    }

    this.queryMetrics.set(queryKey, existing);

    // Detect potential N+1 patterns
    if (existing.totalCalls > 5 && existing.cacheHits / existing.totalCalls < 0.5) {
      console.warn(`📡 Potential N+1 pattern: ${queryKey} (${existing.totalCalls} calls, ${existing.cacheHits} cache hits)`);
    }
  }

  // Bundle analysis
  analyzeBundleSize(): Promise<BundleAnalysis> {
    return new Promise((resolve) => {
      // This would integrate with webpack-bundle-analyzer or similar
      // For now, provide estimated analysis based on what we can detect
      const analysis: BundleAnalysis = {
        totalSize: 0,
        gzippedSize: 0,
        chunks: [],
        largestModules: [],
      };

      // Estimate based on loaded modules
      if (typeof window !== 'undefined' && (window as any).__webpack_require__) {
        // In a real implementation, this would analyze webpack chunks
        console.log('🔍 Bundle analysis would run here with webpack stats');
      }

      resolve(analysis);
    });
  }

  // Memory profiling
  getMemoryUsage(): any {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }
    return null;
  }

  // Generate performance report
  generateReport(): {
    summary: any;
    benchmarks: PerformanceBenchmark[];
    renderProfiles: RenderProfileData[];
    queryMetrics: any[];
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const renderProfiles = Array.from(this.renderProfiles.values());
    const queryMetrics = Array.from(this.queryMetrics.entries()).map(([key, value]) => ({
      queryKey: key,
      ...value,
    }));

    // Analyze for recommendations
    const slowComponents = renderProfiles.filter(p => p.averageRenderTime > 10);
    if (slowComponents.length > 0) {
      recommendations.push(`Consider optimizing these slow components: ${slowComponents.map(c => c.componentName).join(', ')}`);
    }

    const frequentRerenders = renderProfiles.filter(p => p.renderCount > 20 && p.propsChanges / p.renderCount < 0.4);
    if (frequentRerenders.length > 0) {
      recommendations.push(`Add React.memo to these frequently re-rendering components: ${frequentRerenders.map(c => c.componentName).join(', ')}`);
    }

    const inefficientQueries = queryMetrics.filter(q => q.totalCalls > 5 && q.cacheHits / q.totalCalls < 0.5);
    if (inefficientQueries.length > 0) {
      recommendations.push(`Consider query optimization for: ${inefficientQueries.map(q => q.queryKey).join(', ')}`);
    }

    return {
      summary: {
        totalBenchmarks: this.benchmarks.size,
        totalComponents: this.renderProfiles.size,
        totalQueries: this.queryMetrics.size,
        averageRenderTime: renderProfiles.reduce((sum, p) => sum + p.averageRenderTime, 0) / renderProfiles.length || 0,
        memoryUsage: this.getMemoryUsage(),
      },
      benchmarks: Array.from(this.benchmarks.values()),
      renderProfiles,
      queryMetrics,
      recommendations,
    };
  }

  // Clear all data
  reset(): void {
    this.benchmarks.clear();
    this.renderProfiles.clear();
    this.queryMetrics.clear();
  }
}

// Global profiler instance
export const performanceProfiler = new PerformanceProfiler();

// React hook for component profiling
export function useComponentProfiler(componentName: string) {
  const startTime = React.useRef<number>(0);
  
  React.useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime.current;
      performanceProfiler.profileRender(componentName, renderTime);
    };
  });
}

// Bundle size checker utility
export async function checkBundleSize(): Promise<void> {
  const analysis = await performanceProfiler.analyzeBundleSize();
  console.log('📦 Bundle Analysis:', analysis);
}

// Performance budget checker
export function checkPerformanceBudgets(): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  const renderProfiles = Array.from(performanceProfiler['renderProfiles'].values());
  
  // Check render time budget (16ms for 60fps)
  const slowComponents = renderProfiles.filter(p => p.averageRenderTime > 16);
  if (slowComponents.length > 0) {
    violations.push(`Components exceeding 16ms render budget: ${slowComponents.map(c => c.componentName).join(', ')}`);
  }

  // Check memory budget
  const memory = performanceProfiler.getMemoryUsage();
  if (memory && memory.usagePercentage > 80) {
    violations.push(`Memory usage exceeds 80%: ${memory.usagePercentage.toFixed(1)}%`);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}