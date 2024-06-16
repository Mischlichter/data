PIXI.ColorMatrixFilter2=function(){var uniforms={matrix:{type:"mat4",value:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},shift:{type:"4fv",value:[0,0,0,0]}},fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","uniform vec4 filterArea;","uniform mat4 matrix;","uniform vec4 shift;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix + shift;","}"].join("\r\n");PIXI.Filter.call(this,null,fragmentSrc,uniforms)},PIXI.ColorMatrixFilter2.prototype=Object.create(PIXI.Filter.prototype),PIXI.ColorMatrixFilter2.prototype.constructor=PIXI.ColorMatrixFilter2,Object.defineProperty(PIXI.ColorMatrixFilter2.prototype,"matrix",{get:function(){return this.uniforms.matrix},set:function(value){this.uniforms.matrix=value}}),Object.defineProperty(PIXI.ColorMatrixFilter2.prototype,"shift",{get:function(){return this.uniforms.shift},set:function(value){this.uniforms.shift=value}}),PIXI.DepthDisplacementFilter=function(texture,sprite){PIXI.Filter.call(this,`
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

void main(void)
{
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;
   vTextureCoord = aTextureCoord;
}
`,`
    precision mediump float;
    varying vec2 vTextureCoord;
    varying vec2 vFilterCoord;
    uniform sampler2D displacementMap;
    uniform sampler2D uSampler;
    uniform float scale;
    uniform vec2 offset;
    uniform vec4 dimensions;
    uniform vec2 mapDimensions;
    uniform float focus;
 
    void main(void) {
       float aspect = dimensions.x / dimensions.y;
       vec2 scale2 = vec2(scale * min(1.0, 1.0 / aspect), scale * min(1.0, aspect));
       vec2 mapCords = vTextureCoord;
       //mapCords.x *= -1.0;
       //mapCords.y += 1.0;
       float map = texture2D(displacementMap, mapCords).r;
       map = map * -1.0 + focus;
       vec2 disCords = vTextureCoord;
       disCords += offset * map * scale2;
       gl_FragColor = texture2D(uSampler, disCords);
    //    gl_FragColor = vec4(1,1,1,0.5);
    //    gl_FragColor *= texture2D(displacementMap, mapCords);
    }

  `),texture.baseTexture.valid?this.uniforms.mapDimensions=[texture.width,texture.height]:(this.uniforms.mapDimensions=[1,5112],this.boundLoadedFunction=this.onTextureLoaded.bind(this),texture.baseTexture.on("loaded",this.boundLoadedFunction)),this.uniforms.displacementMap=texture,this.uniforms.scale=.015,this.uniforms.offset=[0,0],this.uniforms.focus=.5,this.padding=0,this.sprite=sprite,this.matrix=new PIXI.Matrix,this.apply=function(filterManager,input,output,clear){this.uniforms.dimensions[0]=input.sourceFrame.width,this.uniforms.dimensions[1]=input.sourceFrame.height,this.uniforms.filterMatrix=filterManager.calculateSpriteMatrix(this.matrix,this.sprite),filterManager.applyFilter(this,input,output,clear)}},PIXI.DepthDisplacementFilter.prototype=Object.create(PIXI.Filter.prototype),PIXI.DepthDisplacementFilter.prototype.constructor=PIXI.DepthDisplacementFilter,PIXI.DepthDisplacementFilter.prototype.onTextureLoaded=function(){this.uniforms.mapDimensions=[this.uniforms.displacementMap.width,this.uniforms.displacementMap.height],this.uniforms.displacementMap.baseTexture.off("loaded",this.boundLoadedFunction)},Object.defineProperty(PIXI.DepthDisplacementFilter.prototype,"map",{get:function(){return this.uniforms.displacementMap},set:function(value){this.uniforms.displacementMap=value}}),Object.defineProperty(PIXI.DepthDisplacementFilter.prototype,"scale",{get:function(){return this.uniforms.scale},set:function(value){this.uniforms.scale=value}}),Object.defineProperty(PIXI.DepthDisplacementFilter.prototype,"focus",{get:function(){return this.uniforms.focus},set:function(value){this.uniforms.focus=Math.min(1,Math.max(0,value))}}),Object.defineProperty(PIXI.DepthDisplacementFilter.prototype,"offset",{get:function(){return this.uniforms.offset},set:function(value){this.uniforms.offset=[value.x,value.y]}}),PIXI.DepthPerspectiveFilter=function(texture,quality,sprite){var fragSrc=`
  // Copyright (c) 2014 Rafał Lindemann. http://panrafal.github.com/depthy
  precision mediump float;
  
  varying vec2 vTextureCoord;
  varying vec2 vFiterCoord;
  uniform sampler2D displacementMap;
  uniform sampler2D uSampler;
  uniform vec4 dimensions;
  uniform vec2 mapDimensions;
  uniform float scale;
  uniform vec2 offset;
  uniform float focus;
  
  #if !defined(QUALITY)
  
    #define METHOD 1
    #define CORRECT
  //     #define COLORAVG
    #define ENLARGE 1.5
    #define ANTIALIAS 1
    #define AA_TRIGGER 0.8
    #define AA_POWER 1.0
    #define AA_MAXITER 8.0
    #define MAXSTEPS 16.0
    #define CONFIDENCE_MAX 2.5
  
  #elif QUALITY == 2
  
    #define METHOD 1
    #define CORRECT
  //     #define COLORAVG
    #define MAXSTEPS 4.0
    #define ENLARGE 0.8
  //   #define ANTIALIAS 2
    #define CONFIDENCE_MAX 2.5
  
  #elif QUALITY == 3
  
    #define METHOD 1
    #define CORRECT
  //     #define COLORAVG
    #define MAXSTEPS 6.0
    #define ENLARGE 1.0
    #define ANTIALIAS 2
    #define CONFIDENCE_MAX 2.5
  
  #elif QUALITY == 4
  
    #define METHOD 1
    #define CORRECT
  //     #define COLORAVG
    #define MAXSTEPS 16.0
    #define ENLARGE 1.5
    #define ANTIALIAS 2
    #define CONFIDENCE_MAX 2.5
  
  #elif QUALITY == 5
  
    #define METHOD 1
    #define CORRECT
    #define COLORAVG
    #define MAXSTEPS 40.0
    #define ENLARGE 1.5
  //     #define ANTIALIAS 2
    #define AA_TRIGGER 0.8
    #define AA_POWER 1.0
    #define AA_MAXITER 8.0
    #define CONFIDENCE_MAX 4.5
  
  #endif
  
  
  #define BRANCHLOOP  
  #define BRANCHSAMPLE 
  #define DEBUG 0
  // #define DEBUGBREAK 2
  
  #ifndef METHOD
    #define METHOD 1
  #endif
  #ifndef MAXSTEPS
    #define MAXSTEPS 8.0
  #endif
  #ifndef ENLARGE
    #define ENLARGE 1.2
  #endif
  #ifndef PERSPECTIVE
    #define PERSPECTIVE 0.0
  #endif
  #ifndef UPSCALE
    #define UPSCALE 1.06
  #endif
  #ifndef CONFIDENCE_MAX
    #define CONFIDENCE_MAX 0.2
  #endif
  #ifndef COMPRESSION
    #define COMPRESSION 0.8
  #endif
  
  const float perspective = PERSPECTIVE;
  const float upscale = UPSCALE;
  // float steps = clamp( ceil( max(abs(offset.x), abs(offset.y)) * maxSteps ), 1.0, maxSteps);
  float steps = MAXSTEPS;
  
  #ifdef COLORAVG
  float maskPower = steps * 2.0;// 32.0;
  #else 
  float maskPower = steps * 1.0;// 32.0;
  #endif
  float correctPower = 1.0;//max(1.0, steps / 8.0);
  
  const float compression = COMPRESSION;
  const float dmin = (1.0 - compression) / 2.0;
  const float dmax = (1.0 + compression) / 2.0;
  
  const float vectorCutoff = 0.0 + dmin - 0.0001;
  
  float aspect = dimensions.x / dimensions.y;
  vec2 scale2 = vec2(scale * min(1.0, 1.0 / aspect), scale * min(1.0, aspect)) * vec2(1, 1) * vec2(ENLARGE);
  // mat2 baseVector = mat2(vec2(-focus * offset) * scale2, vec2(offset - focus * offset) * scale2);
  mat2 baseVector = mat2(vec2((0.5 - focus) * offset - offset/2.0) * scale2, 
                         vec2((0.5 - focus) * offset + offset/2.0) * scale2);
  
  
  void main(void) {
  
    vec2 pos = (vTextureCoord - vec2(0.5)) / vec2(upscale) + vec2(0.5);
    mat2 vector = baseVector;
    // perspective shift
    vector[1] += (vec2(2.0) * pos - vec2(1.0)) * vec2(perspective);
    
    float dstep = compression / (steps - 1.0);
    vec2 vstep = (vector[1] - vector[0]) / vec2((steps - 1.0)) ;
    
    #ifdef COLORAVG
      vec4 colSum = vec4(0.0);
    #else
      vec2 posSum = vec2(0.0);
    #endif
  
    float confidenceSum = 0.0;
    float minConfidence = dstep / 2.0;
      
    #ifdef ANTIALIAS
      #ifndef AA_TRIGGER
        #define AA_TRIGGER 0.8
      #endif
      #if ANTIALIAS == 11 || ANTIALIAS == 12
        #ifndef AA_POWER
          #define AA_POWER 0.5
        #endif
        #ifndef AA_MAXITER
          #define AA_MAXITER 16.0
        #endif
        float loopStep = 1.0;
      #endif
      
      #define LOOP_INDEX j
      float j = 0.0;
    #endif
  
    #ifndef LOOP_INDEX
      #define LOOP_INDEX i
    #endif
  
  
    for(float i = 0.0; i < MAXSTEPS; ++i) {
      vec2 vpos = pos + vector[1] - LOOP_INDEX * vstep;
      float dpos = 0.5 + compression / 2.0 - LOOP_INDEX * dstep;
      #ifdef BRANCHLOOP
      if (dpos >= vectorCutoff && confidenceSum < CONFIDENCE_MAX) {
      #endif
        float depth = 1.0 - texture2D(displacementMap, vpos).r;
        depth = clamp(depth, dmin, dmax);
        float confidence;
  
        #if METHOD == 1
          confidence = step(dpos, depth + 0.001);
  
        #elif METHOD == 2
          confidence = 1.0 - abs(dpos - depth);
          if (confidence < 1.0 - minConfidence * 2.0) confidence = 0.0;
  
        #elif METHOD == 5
          confidence = 1.0 - abs(dpos - depth);
          confidence = pow(confidence, maskPower);
  
        #endif
  
        #ifndef BRANCHLOOP
         confidence *= step(vectorCutoff, dpos);
         confidence *= step(confidenceSum, CONFIDENCE_MAX);
        #endif
          
        #ifndef ANTIALIAS
        #elif ANTIALIAS == 1 // go back halfstep, go forward fullstep - branched
          if (confidence > AA_TRIGGER && i == j) {
            j -= 0.5;
          } else {
            j += 1.0;
          }
          // confidence *= CONFIDENCE_MAX / 3.0;
  
        #elif ANTIALIAS == 2 // go back halfstep, go forward fullstep - mult
          j += 1.0 + step(AA_TRIGGER, confidence) 
               * step(i, j) * -1.5; 
          // confidence *= CONFIDENCE_MAX / 3.0;
  
        #elif ANTIALIAS == 11
          if (confidence >= AA_TRIGGER && i == j && steps - i > 1.0) {
            loopStep = AA_POWER * 2.0 / min(AA_MAXITER, steps - i - 1.0);
            j -= AA_POWER + loopStep;
          }
          confidence *= loopStep;
          j += loopStep;
        #elif ANTIALIAS == 12
          float _if_aa = step(AA_TRIGGER, confidence)
                       * step(i, j)
                       * step(1.5, steps - i);
          loopStep = _if_aa * (AA_POWER * 2.0 / min(AA_MAXITER, max(0.1, steps - i - 1.0)) - 1.0) + 1.0;
          confidence *= loopStep;
          j += _if_aa * -(AA_POWER + loopStep) + loopStep;
        #endif
  
          
        #ifdef BRANCHSAMPLE
        if (confidence > 0.0) {
        #endif
          
          #ifdef CORRECT
            #define CORRECTION_MATH +( ( vec2((depth - dpos) / (dstep * correctPower)) * vstep ))
          #else
            #define CORRECTION_MATH
          #endif
            
          #ifdef COLORAVG    
            colSum += texture2D(uSampler, vpos CORRECTION_MATH) * confidence;
          #else
            posSum += (vpos CORRECTION_MATH) * confidence;    
          #endif
            confidenceSum += confidence;
            
        #ifdef BRANCHSAMPLE
        }
        #endif
  
          
        #if DEBUG > 2
          gl_FragColor = vec4(vector[0] / 2.0 + 1.0, vector[1].xy / 2.0 + 1.0);
        #elif DEBUG > 1
          gl_FragColor = vec4(confidenceSum, depth, dpos, 0);
        #elif DEBUG > 0
          gl_FragColor = vec4(confidence, depth, dpos, 0);
        #endif
        #ifdef DEBUGBREAK 
        if (i == float(DEBUGBREAK)) {
            dpos = 0.0;
        }     
        #endif
  
      #ifdef BRANCHLOOP
      }
      #endif
    };
  
    #if defined(COLORAVG) && DEBUG == 0
      gl_FragColor = colSum / vec4(confidenceSum);
    #elif !defined(COLORAVG) && DEBUG == 0
      gl_FragColor = texture2D(uSampler, posSum / confidenceSum);
    #endif
  
  }
    `;(this.quality=quality)&&(fragSrc="#define QUALITY "+quality+"\r\n"+fragSrc),PIXI.Filter.call(this,`
  attribute vec2 aVertexPosition;
  attribute vec2 aTextureCoord;
  
  uniform mat3 projectionMatrix;
  uniform mat3 filterMatrix;
  
  varying vec2 vTextureCoord;
  varying vec2 vFilterCoord;
  
  void main(void)
  {
     gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
     vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;
     vTextureCoord = aTextureCoord;
  }
  `,fragSrc),this.padding=0,this.sprite=sprite,this.matrix=new PIXI.Matrix,this.uniforms.displacementMap=texture,this.uniforms.scale=.015,this.uniforms.offset=[0,0],this.uniforms.focus=.5,this.uniforms.enlarge=1.06,this.apply=function(filterManager,input,output,clear){this.uniforms.dimensions[0]=input.sourceFrame.width,this.uniforms.dimensions[1]=input.sourceFrame.height,this.uniforms.filterMatrix=filterManager.calculateSpriteMatrix(this.matrix,this.sprite),filterManager.applyFilter(this,input,output,clear)}},PIXI.DepthPerspectiveFilter.prototype=Object.create(PIXI.Filter.prototype),PIXI.DepthPerspectiveFilter.prototype.constructor=PIXI.DepthPerspectiveFilter,Object.defineProperty(PIXI.DepthPerspectiveFilter.prototype,"map",{get:function(){return this.uniforms.displacementMap},set:function(value){this.uniforms.displacementMap=value}}),Object.defineProperty(PIXI.DepthPerspectiveFilter.prototype,"scale",{get:function(){return this.uniforms.scale},set:function(value){this.uniforms.scale=value}}),Object.defineProperty(PIXI.DepthPerspectiveFilter.prototype,"focus",{get:function(){return this.uniforms.focus},set:function(value){this.uniforms.focus=Math.min(1,Math.max(0,value))}}),Object.defineProperty(PIXI.DepthPerspectiveFilter.prototype,"enlarge",{get:function(){return this.uniforms.enlarge},set:function(value){this.uniforms.enlarge=value}}),Object.defineProperty(PIXI.DepthPerspectiveFilter.prototype,"offset",{get:function(){return this.uniforms.offset},set:function(value){this.uniforms.offset=[value.x,value.y]}}),function(root){var Promise=root.Q&&root.Q.Promise||root.RSVP&&root.RSVP.Promise||root.Promise,defaultOptions={size:null,sizeDivisible:1,fit:"cover",retina:!0,upscale:1,enlarge:1.06,animate:!0,animateDuration:6,animatePosition:null,animateScale:{x:1.5,y:1.5},depthScale:2,depthBlurSize:4,depthFocus:.5,depthPreview:0,easeFactor:.4,orient:2,hover:!0,hoverElement:!0,quality:!1,qualityMin:1,qualityMax:5,qualityStart:4,alwaysRender:!0,pauseRender:!1},pauseRender=!1;(root.DepthyViewer=function(element,options){var canvas,app,stage,renderer,stats,resetAlphaFilter,invertedAlphaToRGBFilter,depthBlurFilter,grayscaleFilter,stageSize,stageSizeCPX,readyResolver,imageTextureSprite,imageTextureContainer,imageRender,depthTextureSprite,depthTextureContainer,depthRender,depthFilter,compoundSprite,previewSprite,self=this,image={},depth={},sizeDirty=!0,stageDirty=!0,renderDirty=!0,depthFilterDirty=!0,quality={current:options.qualityStart||4,dirty:!0,provenSlow:{}},depthOffset={x:0,y:0},easedOffset=depthOffset,scaleFactor=(pauseRender=!1,(options=defaultOptions).scaleFactor||1),xbase=options.xbase||0,ybase=options.ybase||0;function createDiscardAlphaFilter(alphaConst){var filter=new PIXI.ColorMatrixFilter2;return filter.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],filter.shift=[0,0,0,alphaConst||0],filter}function createDiscardRGBFilter(){var filter=new PIXI.ColorMatrixFilter2;return filter.matrix=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],filter.shift=[0,0,0,0],filter}function createInvertedRGBToAlphaFilter(){var filter=new PIXI.ColorMatrixFilter2;return filter.matrix=[0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0],filter.shift=[0,0,0,1],filter}function sizeCopy(size,expand){return{width:size.width*(expand=expand||1),height:size.height*expand}}function sizeFit(size,max,cover){var ratio=size.width/size.height;return size=sizeCopy(size),(cover&&size.height<max.height||!cover&&size.height>max.height)&&(size.height=max.height,size.width=size.height*ratio),(cover&&size.width<max.width||!cover&&size.width>max.width)&&(size.width=max.width,size.height=size.width/ratio),size}function sizeRound(size){return{width:Math.round(size.width),height:Math.round(size.height)}}function sizeFitScale(size,max){return max.height/size.height}function isReady(){return!(!1===renderer||!image.texture||!image.size||depth.texture&&!depth.size)}function hasImage(){return!!image.texture}function hasDepthmap(){return!!depth.texture}function changeTexture(old,source){var current;return old.texture===source||old.url===source?old:((current={dirty:!0}).promise=new Promise(function(resolve,reject){source?(source instanceof PIXI.RenderTexture?current.texture=source:(current.texture=PIXI.Texture.from(source),current.url=source),current.texture.baseTexture.premultipliedAlpha=!1,current.texture.baseTexture.valid?(current.size=current.texture.frame,sizeDirty=!0,resolve(current)):(current.texture.addListener("update",function(){current.texture&&(current.size=current.texture.frame,sizeDirty=!0,resolve(current))}),current.texture.baseTexture.source.onerror=function(error){current.texture&&(current.error=!0,current.texture.destroy(!0),delete current.texture,reject(error))})):resolve(current),old&&(!old.texture||image.texture&&depth.texture&&image.texture===depth.texture||old.shared||old.texture.destroy(!0),old.texture=null)}),current)}function updateSize(){var canvasHeight,containerWidth=container.offsetWidth,containerHeight=container.offsetHeight,smoothAspectRatio=function(containerWidth,containerHeight){return(containerWidth/=containerHeight)<1?1.6:1<=containerWidth&&containerWidth<4/3?1.6+(containerWidth-1)/(4/3-1)*(1.9-1.6):1.9}(containerWidth,containerHeight),scaleFactor=self.getScaleFactor();self.getxbase(),self.getybase();containerHeight=containerWidth<containerHeight?{width:canvasHeight=containerHeight/smoothAspectRatio,height:canvasHeight,left:"50%",transform:"translate(-50%, -50%)",top:"50%"}:{width:containerWidth,height:canvasHeight=containerWidth/smoothAspectRatio,left:"50%",transform:"translate(-50%, -50%)",top:"50%"},(stageSize=containerHeight).width=containerHeight.width*scaleFactor,stageSize.height=containerHeight.height*scaleFactor,stageSizeCPX=sizeRound(stageSize),canvas.style.width=stageSize.width+"px",canvas.style.height=stageSize.height+"px",canvas.style.left=containerHeight.left,canvas.style.position="absolute",canvas.style.transform=containerHeight.transform,canvas.style.top=containerHeight.top,canvas.style.border="50px solid black",canvas.style.background="black",!renderer||renderer.width===stageSize.width&&renderer.height===stageSize.height||(renderer.resize(stageSize.width,stageSize.height),image.dirty=depth.dirty=!0,stageDirty=!0),sizeDirty=!1}self.getPauseRender=function(){return pauseRender},self.setPauseRender=function(value){pauseRender=value},self.getScaleFactor=function(){return scaleFactor},self.setScaleFactor=function(newScaleFactor){scaleFactor=newScaleFactor||1},self.getxbase=function(){return xbase},self.getybase=function(){return ybase},self.setxbase=function(newxbase){xbase=newxbase||0},self.setybase=function(newybase){ybase=newybase||0};var depthFiltersCache={};function updateStage(){var q=options.quality||quality.current;previewSprite&&stage.removeChild(previewSprite),(previewSprite=new PIXI.Sprite(depthRender)).renderable=!1,stage.addChild(previewSprite),depthFilter&&depthFilter.quality===q||(depthFiltersCache[q]=depthFilter=depthFiltersCache[q]||(1===q?new PIXI.DepthDisplacementFilter(depthRender):new PIXI.DepthPerspectiveFilter(depth.texture,q,previewSprite)),depthFilter.quality=q),depthFilter.map!==depthRender&&(depthFilter.map=depthRender),depthFilter.sprite!==previewSprite&&(depthFilter.sprite=previewSprite,depthFilter.map=previewSprite._texture),compoundSprite&&stage.removeChild(compoundSprite),(compoundSprite=new PIXI.Sprite(imageRender)).filters=[depthFilter],stage.addChildAt(compoundSprite,0),renderDirty=depthFilterDirty=!(stageDirty=!1),quality.dirty=!0}function updateDepthFilter(){depthFilter.scale=.02*options.depthScale,depthFilter.offset={x:easedOffset.x||0,y:easedOffset.y||0},depthFilter.focus=0,depthFilter.enlarge=options.enlarge,previewSprite.visible=0!=options.depthPreview,previewSprite.alpha=options.depthPreview,renderDirty=!(depthFilterDirty=!1)}function changeQuality(q){quality.measured=!0,(q=Math.max(options.qualityMin,Math.min(options.qualityMax,q)))>quality.current&&quality.provenSlow[q]&&stageSize.width*stageSize.height>=quality.provenSlow[q]||(quality.current=q,stageDirty=!0),updateDebug()}function updateDebug(){stats&&(stats.domElement.className="q"+quality.current+(quality.measured?"":" qm"),stats.infoElement.textContent="Q"+(options.quality||quality.current)+(quality.measured?"":"?")+" <"+quality.slow+" >"+quality.fast+" n"+quality.count+" ~"+Math.round(quality.avg))}function update(){var input,scale;sizeDirty&&updateSize(),image.dirty&&(scale=sizeFitScale(image.size,stageSize),(imageTextureSprite=new PIXI.Sprite(image.texture)).scale.set(scale,scale),imageTextureSprite.anchor.set(.5,.5),imageTextureSprite.position.set(stageSize.width/2,stageSize.height/2),(imageTextureContainer=new PIXI.Container).addChild(imageTextureSprite),!imageRender||imageRender.width===stageSize.width&&imageRender.height===stageSize.height||(imageRender.destroy(!0),imageRender=null),imageRender=imageRender||new PIXI.RenderTexture.create(stageSize.width,stageSize.height),image.dirty=!1,image.renderDirty=stageDirty=!0),image.renderDirty&&(renderer.render(imageTextureContainer,imageRender),image.renderDirty=!1,renderDirty=!0),depth.dirty&&function(){var scale=depth.size?sizeFitScale(depth.size,stageSize):1;depthTextureContainer=new PIXI.Container,depth.texture?((depthTextureSprite=new PIXI.Sprite(depth.texture)).filters=[depthBlurFilter],depthTextureSprite.scale.set(scale,scale),depthTextureSprite.renderable=!!depth.texture,depthTextureSprite.anchor.set(.5,.5),depthTextureSprite.position.set(stageSize.width/2,stageSize.height/2),depth.useAlpha&&(depthTextureSprite.filters.push(invertedAlphaToRGBFilter),depthTextureSprite.filters=depthTextureSprite.filters),depthTextureContainer.addChild(depthTextureSprite)):depthTextureSprite=null,!depthRender||depthRender.width===stageSize.width&&depthRender.height===stageSize.height||(depthRender.destroy(!0),depthRender=null),depthRender=depthRender||new PIXI.RenderTexture.create(stageSize.width,stageSize.height),depth.dirty=!1,depth.renderDirty=stageDirty=!0}(),depth.renderDirty&&(depthBlurFilter.blur=options.depthBlurSize,renderer.render(depthTextureContainer,depthRender),depth.renderDirty=!1,renderDirty=!0),stageDirty&&updateStage(),depthFilterDirty&&updateDepthFilter(),depth.texture&&(depthOffset.x===easedOffset.x&&depthOffset.y===easedOffset.y||((!options.easeFactor||options.animate||(easedOffset.x=easedOffset.x*options.easeFactor+depthOffset.x*(1-options.easeFactor),easedOffset.y=easedOffset.y*options.easeFactor+depthOffset.y*(1-options.easeFactor),Math.abs(easedOffset.x-depthOffset.x)<1e-4&&Math.abs(easedOffset.y-depthOffset.y)<1e-4))&&(easedOffset=depthOffset),depthFilter.offset={x:easedOffset.x,y:easedOffset.y},renderDirty=!0),scale=self.getScaleFactor(),+(input=options.animatePosition)==input&&0<(""+input).trim().length?(options.animatePosition,options.animateDuration):window.performance&&window.performance.now?window.performance.now():(new Date).getTime(),depthFilter.offset={x:mouseX/scale,y:mouseY/scale},renderDirty=!0),readyResolver&&(readyResolver(),readyResolver=null)}function render(){isReady()&&(update(),(renderDirty||options.alwaysRender)&&(renderer.render(stage),renderDirty=!1),!quality.dirty&&quality.measured||depth.texture&&hasImage()&&!options.quality&&(quality.dirty&&(quality.count=quality.slow=quality.fast=quality.sum=0,quality.measured=!1,quality.dirty=!1,updateDebug()),quality.count++,quality.fps=1e3/quality.ms,quality.sum+=quality.fps,quality.avg=quality.sum/quality.count,quality.fps<10?quality.slow++:58<quality.fps&&quality.fast++,5<quality.slow||15<quality.count&&quality.avg<(4<quality.current?55:25)?(options.quality||(quality.provenSlow[quality.current]=stageSize.width*stageSize.height),changeQuality(quality.current-1)):40<quality.count&&quality.avg>(3<quality.current?55:50)?changeQuality(quality.current+1):60<quality.count?changeQuality(quality.current):renderDirty=!0))}var lastLoopTime=0;function renderLoop(){pauseRender||(quality.ms=lastLoopTime&&performance.now()-lastLoopTime,lastLoopTime=performance.now(),stats&&stats.begin(),render(),stats&&stats.end(),0),requestAnimationFrame(renderLoop)}this.setOptions=function(newOptions){for(var k in newOptions)if(options[k]!==newOptions[k])switch(options[k]=newOptions[k],k){case"size":case"fit":case"retina":case"upscale":sizeDirty=!0;break;case"quality":stageDirty=!0,updateDebug();break;case"depthScale":case"depthFocus":case"depthPreview":depthFilterDirty=!0;break;case"depthBlurSize":depth.renderDirty=!0;break;default:renderDirty=!0}},this.getOptions=function(){var k,oc={};for(k in options)oc[k]=options[k];return oc},this.getElement=function(){return element},this.getCanvas=function(){return canvas},this.getRenderer=function(){return renderer},this.getSize=function(){return sizeCopy(stageSize)},this.getSizeCPX=function(){return sizeCopy(stageSizeCPX)},this.getQuality=function(){return quality.current},this.getPromise=function(resolvedOnly){var promise;return resolvedOnly||this.hasImage()&&!this.getLoadError()?isReady()?Promise.resolve():(readyResolver||(promise=new Promise(function(resolve){readyResolver=resolve}),readyResolver.promise=promise),resolvedOnly?readyResolver.promise:Promise.all([image.promise,depth.promise,readyResolver.promise])):Promise.reject()},this.setImage=function(source){return(image=changeTexture(image,source)).promise},this.getImage=function(){return image},this.setDepthmap=function(source,useAlpha){return(depth=changeTexture(depth,source)).useAlpha=!!useAlpha,depth.promise},this.getDepthmap=function(){return depth},this.render=render,this.reset=function(){this.setImage(),this.setDepthmap()},this.hasImage=hasImage,this.hasDepthmap=hasDepthmap,this.getLoadError=function(){return image.error||depth.error},this.setOffset=function(offset){depthOffset=offset},this.screenToImagePos=function(pos,clamp){var rect=canvas.getBoundingClientRect();return(pos={x:pos.x,y:pos.y}).x=(pos.x-rect.left)/rect.width,pos.y=(pos.y-rect.top)/rect.height,clamp&&(pos.x=Math.max(110,Math.min(1,pos.x)),pos.y=Math.max(0,Math.min(1,pos.y))),pos},this.exportToPNG=function(maxSize){return this.getPromise().then(function(){if(!depth.texture)return!1;var size=sizeRound(sizeFit(image.size,maxSize||image.size)),localstage=new PIXI.Stage,scale=size.width/image.size.width,depthScale=size.width/depth.size.width,size=new PIXI.WebGLRenderer(size.width,size.height,null,"notMultiplied",!0),imageSprite=new PIXI.Sprite(image.texture),scale=(imageSprite.scale=new PIXI.Point(scale,scale),localstage.addChild(imageSprite),imageSprite.filters=[createDiscardAlphaFilter()],new PIXI.Sprite(depth.texture)),imageSprite=(scale.scale=new PIXI.Point(depthScale,depthScale),scale.filters=[(depth.useAlpha?createDiscardRGBFilter:createInvertedRGBToAlphaFilter)()],PIXI.blendModesWebGL["one.one"]=[size.gl.ONE,size.gl.ONE],scale.blendMode="one.one",localstage.addChild(scale),size.render(localstage),size.view.toDataURL("image/png"));try{size.destroy()}catch(e){}return imageSprite})},this.exportDepthmapAsTexture=function(maxSize){var sprite,scale,size=sizeCopy(image.size),maxSize=(size=sizeRound(size=maxSize?sizeFit(size,maxSize):size),new PIXI.RenderTexture(size.width,size.height)),container=new PIXI.Container;return depth.texture?(scale=sizeFitScale(depth.size,size),(sprite=new PIXI.Sprite(depth.texture)).scale=new PIXI.Point(scale,scale),sprite.anchor={x:.5,y:.5},sprite.position={x:size.width/2,y:size.height/2},depth.useAlpha?sprite.filters=[invertedAlphaToRGBFilter]:sprite.filters=[grayscaleFilter],container.addChild(sprite)):((scale=new PIXI.Graphics).beginFill(16777215,1),scale.drawRect(0,0,size.width,size.height),container.addChild(scale)),maxSize.render(container,null,!0),maxSize},this.exportThumbnail=function(size,quality){return size=size||{width:50,height:50},this.getPromise().then(function(){var localstage=new PIXI.Stage,scale=sizeFitScale(image.size,size),renderTexture=new PIXI.RenderTexture(size.width,size.height),imageSprite=new PIXI.Sprite(image.texture);imageSprite.scale=new PIXI.Point(scale,scale),imageSprite.anchor={x:.5,y:.5},imageSprite.position={x:size.width/2,y:size.height/2},localstage.addChild(imageSprite),imageSprite.filters=[resetAlphaFilter],renderTexture.render(localstage,null,!0);scale=PIXI.glReadPixelsToCanvas(renderer.gl,renderTexture,0,0,renderTexture.width,renderTexture.height).toDataURL("image/jpeg",quality);try{renderTexture.destroy()}catch(e){}return scale})},this.exportAnaglyph=function(exportOpts){return this.getPromise().then(function(){var size=sizeCopy(exportOpts.size||image.size),oldOptions=(exportOpts.maxSize&&(size=sizeFit(size,exportOpts.maxSize)),size=sizeRound(size=exportOpts.minSize?sizeFit(size,exportOpts.minSize,!0):size),self.getOptions()),size=(self.setOptions({animate:!1,size:size,fit:!1,orient:!1,hover:!1,depthPreview:0,quality:5}),update(),new PIXI.Stage),leftEye=compoundSprite,filter=(depthFilter.offset={x:-1,y:.5},(filter=new PIXI.ColorMatrixFilter2).matrix=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],leftEye.filters.push(filter),leftEye.filters=leftEye.filters,size.addChild(leftEye),compoundSprite=null,(depthFilter=new PIXI.DepthPerspectiveFilter(depthRender,options.quality)).quality=options.quality,updateStage(),updateDepthFilter(),leftEye=compoundSprite,depthFilter.offset={x:1,y:.5},(filter=new PIXI.ColorMatrixFilter2).matrix=[0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],leftEye.filters.push(filter),leftEye.filters=leftEye.filters,PIXI.blendModesWebGL["one.one"]=[renderer.gl.ONE,renderer.gl.ONE],leftEye.blendMode="one.one",size.addChild(leftEye),renderer.render(size),canvas.toDataURL("image/jpeg",exportOpts.quality||.9));return depthFilter=compoundSprite=null,self.setOptions(oldOptions),render(),filter})},this.enableDebug=function(){window.Stats&&((stats=new window.Stats).setMode(0),stats.infoElement=document.createElement("div"),stats.infoElement.className="info",stats.domElement.appendChild(stats.infoElement),document.body.appendChild(stats.domElement),updateDebug())},this.isReady=isReady;try{app=new PIXI.Application({width:1536,height:1024,transparent:!0}),element.appendChild(app.view),stage=app.stage,renderer=app.renderer,canvas=renderer.view,createDiscardAlphaFilter(),resetAlphaFilter=createDiscardAlphaFilter(1),invertedAlphaToRGBFilter=function(){var filter=new PIXI.ColorMatrixFilter2;return filter.matrix=[0,0,0,-1,0,0,0,-1,0,0,0,-1,0,0,0,0],filter.shift=[1,1,1,1],filter}(),createDiscardRGBFilter(),createInvertedRGBToAlphaFilter(),depthBlurFilter=new PIXI.filters.BlurFilter,grayscaleFilter=function(){var filter=new PIXI.ColorMatrixFilter2;return filter.matrix=[.333,.333,.333,0,.333,.333,.333,0,.333,.333,.333,0,0,0,0,1],filter}()}catch(e){renderer=!1}renderer&&requestAnimationFrame(renderLoop),window.addEventListener("resize",function(event){updateSize()},!0)}).defaultOptions=defaultOptions}(window);