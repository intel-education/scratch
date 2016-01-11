/*******************************************************************************
INTEL CORPORATION PROPRIETARY INFORMATION
This software is supplied under the terms of a license agreement or nondisclosure
agreement with Intel Corporation and may not be copied or disclosed except in
accordance with the terms of that agreement
@licence Copyright(c) 2014-2015 Intel Corporation. All Rights Reserved.
*******************************************************************************/



// intel_realsense_extension.js
// Shachar Oz , Omer Goshen , Moria Ilan Navi
// 2015
// Intel RealSense Extension for Scratch 
// version 1.4








 
















"use strict";

(function (ext) {
    
        
    //modal alert window
        $.ajax({
            url: 'http://intel-realsense-extension-for-scratch.github.io/public/extension/dialog.html',
            method: 'GET',
            // async: false,
            success: function(data) {
                $('body').append(data);
            }
        });
    //
    
    
    
    
    var rs = null;
    var sense; 
    var faceModule, blobModule, handModule, speechModule;
    var blobConfiguration, handConfiguration, faceConfiguration;
    var imageSize;
    

    
    //stage mapping
    const RS_FACE_X_MAX_RIGHT = 0;    
    const RS_FACE_X_MAX_LEFT = 600;    
    const RS_FACE_Y_MAX_UP = 250;      
    const RS_FACE_Y_MAX_DOWN = 0;       
    
    const RS_FACE_ROTATION_MIN = -30;
    const RS_FACE_ROTATION_MAX = 30;
    
    const RS_HAND_X_MAX_RIGHT = 0;
    const RS_HAND_X_MAX_LEFT = 600;
    const RS_HAND_Y_MAX_UP = 600;
    const RS_HAND_Y_MAX_DOWN = 0;

    const SCRATCH_X_MAX_RIGHT = 240;    
    const SCRATCH_X_MAX_LEFT = -240;   
    const SCRATCH_Y_MAX_UP = -180; 
    const SCRATCH_Y_MAX_DOWN = 180;
    

    
    
      
    var HandModule = function () {
        // private
        //
        
        return {
            // public
            isRightExist: false
            , isLeftExist: false
            , leftHandJoints: []  
            , leftHandJointsFoldness: []  
            , rightHandJoints: []  
            , rightHandJointsFoldness: []  
            , leftHandGestures: []
            , rightHandGestures: []
            
            , jointDictionary : {}
            , majorJointDictionary : {}
            , gestureDictionary : {}
            
            , init: function(){
                this.jointDictionary = {
                   "Wrist"                  : intel.realsense.hand.JointType.JOINT_WRIST
                    , "Center"              : intel.realsense.hand.JointType.JOINT_CENTER

                    , "Thumb base"          : intel.realsense.hand.JointType.JOINT_THUMB_BASE
                    , "Thumb jointC"        : intel.realsense.hand.JointType.JOINT_THUMB_JT1
                    , "Thumb jointB"        : intel.realsense.hand.JointType.JOINT_THUMB_JT2 
                    , "Thumb tip"           : intel.realsense.hand.JointType.JOINT_THUMB_TIP

                    , "Index base"          : intel.realsense.hand.JointType.JOINT_INDEX_BASE
                    , "Index jointC"        : intel.realsense.hand.JointType.JOINT_INDEX_JT1
                    , "Index jointB"        : intel.realsense.hand.JointType.JOINT_INDEX_JT2
                    , "Index tip"           : intel.realsense.hand.JointType.JOINT_INDEX_TIP

                    , "Middle base"         : intel.realsense.hand.JointType.JOINT_MIDDLE_BASE
                    , "Middle jointC"       : intel.realsense.hand.JointType.JOINT_MIDDLE_JT1
                    , "Middle jointB"       : intel.realsense.hand.JointType.JOINT_MIDDLE_JT2
                    , "Middle tip"          : intel.realsense.hand.JointType.JOINT_MIDDLE_TIP

                    , "Ring base"           : intel.realsense.hand.JointType.JOINT_RING_BASE
                    , "Ring jointC"         : intel.realsense.hand.JointType.JOINT_RING_JT1
                    , "Ring jointB"         : intel.realsense.hand.JointType.JOINT_RING_JT2
                    , "Ring tip"            : intel.realsense.hand.JointType.JOINT_RING_TIP

                    , "Pinky base"          : intel.realsense.hand.JointType.JOINT_PINKY_BASE
                    , "Pinky jointC"        : intel.realsense.hand.JointType.JOINT_PINKY_JT1
                    , "Pinky jointB"        : intel.realsense.hand.JointType.JOINT_PINKY_JT2
                    , "Pinky tip"           : intel.realsense.hand.JointType.JOINT_PINKY_TIP
                };

                this.majorJointDictionary = {
                    "Index"                 : intel.realsense.hand.FingerType.FINGER_INDEX
                    , "Thumb"               : intel.realsense.hand.FingerType.FINGER_THUMB
                    , "Middle"              : intel.realsense.hand.FingerType.FINGER_MIDDLE
                    , "Ring"                : intel.realsense.hand.FingerType.FINGER_RING
                    , "Pinky"               : intel.realsense.hand.FingerType.FINGER_PINKY
                };
                
                this.gestureDictionary = {
                    "Spread fingers"            : "spreadfingers"
                    , "V sign"                  : "v_sign"
                    , "Full pinch"              : "full_pinch"
                    , "Two fingers pinch open"  : "two_fingers_pinch_open"
                    , "Fist"                    : "fist"
                    , "Thumb up"                : "thumb_up"
                    , "Thumb down"              : "thumb_down"
                    
                    , "Swipe down"              : "swipe_down"
                    , "Swipe up"                : "swipe_up"
                    , "Swipe left"              : "swipe_left"
                    , "Swipe right"             : "swipe_right"
                    
                    , "Tap"                     : "tap"
                    , "Wave"                    : "wave"
                };
            }
        }
    };
    
    
  
    
    
    
    var FaceModule = function () {
        // private
        //
        
        return {
            // public
            isExist: false
            , joints: []              
            , expressionsOccuredLastFrame : []
            , headRotation: {}
            
            , landmarkDictionary : {}  
            , expressionsDictionary : {}
            
            , init: function(){
                //Bug: Smile and Kiss are switched!
                this.expressionsDictionary = {
                     "Brow lifted right"    : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_RAISER_RIGHT
                    , "Brow lifted left"    : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_RAISER_LEFT
                    , "Brow lowered left"   : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_LOWERER_LEFT
                    , "Brow lowered right"  : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_LOWERER_RIGHT
                    , "Smile"               :
                    intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_KISS
                    , "Kiss"                :  intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_SMILE
                    , "Mouth open"          : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_MOUTH_OPEN
                    , "Wink left"           : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_EYES_CLOSED_LEFT
                    , "Wink right"          : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_EYES_CLOSED_RIGHT
                    , "Tongue out"          : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_TONGUE_OUT
                };
                
                // Converter: face joint index => face joint name
                // temporary solution. will be updated in the future
                this.landmarkDictionary = {
                    "Left eye"          : 77
                    , "Right eye"       : 76
                    , "Left eye brow"   : 7
                    , "Right eye brow"  : 2
                    , "Chin"            : 61
                    , "Upper lip"       : 36
                    , "Bottom lip"      : 42
                    , "Nose"            : 29
                };

            }
        }
    };
          
    
    
    
    var BlobModule = function () {
        // private
        //
        
        return {
            // public
            isExist: false
        }
    };
    
    
    var SpeechModule = function () {
        // private
        // 
        
        return {
            // public
            commands : []
            , recognizedWords : []          // { timestamp , word }
            , tolerance : 1                 // speech tolerance in seconds
            , confidenceTolerance: 40       // speech tolerance to other words (in precentages)
            , isUserSaidUnknown : false     // did user said something unknown
            , isUserSpoke : false           // did user said anything at all
            , addHighestResultOnly : true   // add to the result array only the result with the highest value 
            , isUpdatingGrammar : false     //make sure we dont update grammar twice in parallel

            
            , init : function() {
                //init the app with a set of commonly used voice commands 
                this.commands = ['hello', 'hi', 'yes', 'no'];
                //, 'bye', 'left', 'right', 'up', 'down'];
               
            }
        }
    };
    
    //suitable for scratch status api
    var ScratchStatus = function () {
        // private
        //
        
        return {
            // public
            status: 1
            , msg: 'Checking your system...'
            , msgContent: 'content for Error Message'
        }
    };
    
    var RealSenseData = function() {
        return {
            HandModule: new HandModule(),
            FaceModule: new FaceModule(),            
            BlobModule: new BlobModule(),
            SpeechModule: new SpeechModule(),
            Status: new ScratchStatus()
        }
    };
    
    var rsd = new RealSenseData();
    
    
    
    
    
    
    var onConnect = function (sender, connected) {
        
        if (connected == true) {
            console.log('Connect with device instance: ' + sender.instance);
            
            
            //only after sense.init() and onDeviceConnected we know the sensor
            if (sender.deviceInfo.model == rs.DeviceModel.DEVICE_MODEL_R200 ||
                sender.deviceInfo.orientation == rs.DeviceOrientation.DEVICE_ORIENTATION_WORLD_FACING) {
                
                rsd.Status = { 
                    status : 0
                    , msg : 'Intel® RealSense™ 3D Sensor not suitable' 
                    , msgContent : 'This extension currently supports Intel® RealSense™ F200 Sensor. Visit <a href="https://www-ssl.intel.com/content/www/us/en/architecture-and-technology/realsense-devices.html" target="_blank">here</a> to get a new sensor.'
                };
                
                PopAlert();
            }
            
        } else {
            // console.warn('sensor not connected');
            
            rsd.Status = { 
                status : 0
                , msg : 'Sensor not connected'
                ,msgContent: 'Intel® RealSense™ Sensor is not detected. <br>Please reconnect your sensor and refresh the page.' 
            };
            
            PopAlert();
        }
    };
    
    
    var onStatus = function (sender, sts) {
        // console.log([sender, sts]);
        if (sts < 0) {
            console.warn('Error ' + sts + ' on module ' + sender);
            
            switch (sts){
                case 503:
                    console.warn('Capabilities.Servicer.Realsense.exe must be restarted! shut it down and restart Intel technologyAccess and DCM');   
                    
                    rsd.Status = {
                        status: 0 
                        , msg : 'Software not ready'
                        , msgContent : 'Intel® Technology Access not working properly. <br>Please restart your PC and make sure you are connected to a public WIFI network.'
                    };
                    break;


                // error on sensor disconnect from USB (sometimes not occurs)
                case -301:
                    rsd.Status = {
                        status: 1 
                        , msg : 'Sensor disconnected'
                        , msgContent : 'Intel® RealSense™ Sensor was disconnected from USB. <br>Please reconnect your sensor and refresh the page.'
                    };
                    break;
            }
            
            PopAlert();
            
            onClearSensor();
        }
    };
    
    
    var onClearSensor = function () {
        console.log("reset realsense sensor");
        
        if (speechModule != undefined) {
            speechModule.stopRec().then(function (result) {
                speechModule.release();
                speechModule = undefined;
                
                if (sense != undefined) {
                    sense.release()
                    .then(function (result) {
                        sense = undefined;
                    });
                }
            });
        } else {
            //even if no speech module, we should see if this needs a reset too
            if (sense != undefined) {
                sense.release()
                .then(function (result) {
                    sense = undefined;
                });
            }
        }
    };
    
    
    //shutdown realsense when refresh window 
    $(window).bind("beforeunload", function (e) {
        onClearSensor();
    });
    
    
    /**********************************************************************************************************/
    /*************************************FACE RECOGNITION*****************************************************/
    /**********************************************************************************************************/

  
    var onFaceHandData = function (sender, data) {
        if (sender == faceModule)
            onFaceData(sender, data);
        else if (sender == handModule)
            onHandData(sender, data); 
    };
    
    
    /*RealSense Face Recognition event being called continuously, once enabling Face module*/
    var onFaceData = function(module, faceData) {
        
        //reset the face data every frame 
        rsd.FaceModule.expressionsOccuredLastFrame=[];
        
        rsd.FaceModule.joints = [];
        
        rsd.FaceModule.headRotation = {
                                        X: 0
                                        ,Y: 0
                                        ,Z: 0
                                    };      
        
        if (faceData.faces == null || faceData.faces.length == 0) {
            rsd.FaceModule.isExist = false;
            return;
        }
        
        
        
//for face exist block
        rsd.FaceModule.isExist = (faceData.faces.length > 0);
         
        if (faceData.faces.length > 0) {
            for (var f = 0; f < faceData.faces.length; f++) {
                var face = faceData.faces[f];
                
//for face joints block
                if (face.landmarks.points != undefined) {
                    var jointIndex = 0;
               
                    for (var i = 0; i < face.landmarks.points.length; i++) {
                        var joint = face.landmarks.points[i];
                        if (joint != null) {
                               
                            var faceJoint = {};
                            faceJoint.originalJointIndex = i; //maybe use joint.index;
                            faceJoint.position = {
                                 X: joint.image.x
                                ,Y: joint.image.y
                                ,Z: joint.world.z
                            };
                            
                            rsd.FaceModule.joints.push(faceJoint);
                        }
                    }
                }
                
  
//face expression block
                if (face.expressions !== null && face.expressions.expressions != null) {
                    // console.log('Expressions: ' + JSON.stringify(face.expressions.expressions));
                    
                    for (var fe=0; fe<face.expressions.expressions.length; fe++){
                        var f_expr = face.expressions.expressions[fe];
                        if (f_expr.intensity>20) {
                            //add it to array of current frame only
                            rsd.FaceModule.expressionsOccuredLastFrame.push(fe);
                        }
                    }
                }
                
                
                
//for head rotation block
                if (face.pose != undefined && face.pose != null) {
                    //console.warn('Pose: ' + JSON.stringify(face.pose));
                    //console.warn('Pose: ' + face.pose.poseAngles.roll);
                    
                    var head_rotation = {
                                             Yaw: face.pose.poseAngles.yaw
                                            ,Pitch: face.pose.poseAngles.pitch
                                            ,Roll: face.pose.poseAngles.roll
                                        };
                    
                    rsd.FaceModule.headRotation = head_rotation;
                    
                }
            }
        }
    };
    


   


    /**********************************************************************************************************/
    /*************************************END FACE RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
     /**********************************************************************************************************/
    /*************************************HAND RECOGNITION*****************************************************/
    /**********************************************************************************************************/

    /* RealSense Hands Viewer event being called continuously, once enabling Hands module */
    var onHandData = function (module, handData) {
        
        //reset all data each frame
        var _isRightExist = false;
        var _isLeftExist = false;
        
        var _leftHandJoints = [];
        var _rightHandJoints = [];
        
        rsd.HandModule.leftHandJointsFoldness = [];
        rsd.HandModule.rightHandJointsFoldness = [];
        
        
        if (handData.numberOfHands == 0) {
            
            rsd.HandModule.isRightExist = _isRightExist;
            rsd.HandModule.isLeftExist = _isLeftExist;
            rsd.HandModule.leftHandJoints = _leftHandJoints;
            rsd.HandModule.rightHandJoints = _rightHandJoints;
            
            return;
        }
        
        
        //saving hand id rellevant in order to know which gesture belongs to which hand
        var _leftHandId, _rightHandId = -1;
        
        
        //start collecting
        var allHandsData = handData.queryHandData(intel.realsense.hand.AccessOrderType.ACCESS_ORDER_NEAR_TO_FAR);
        
        for (var h = 0; h < handData.numberOfHands; h++) {
            var ihand = allHandsData[h];
            var joints = ihand.trackedJoints;
            
            var tempResultJointsArray = [];
            
            for (var j = 0; j < joints.length; j++) {            
                
                if (joints[j] == null || joints[j].confidence <= 10) continue;
   
                var joint = {};
                joint.originalJointIndex = j;
                joint.confidence = joints[j].confidence;
                
                joint.position = {
                    X: joints[j].positionImage.x
                    ,Y: joints[j].positionImage.y
                    ,Z: joints[j].positionWorld.z
                };
                
                joint.rotation = {
                    X: joints[j].localRotation.x
                    ,Y: joints[j].localRotation.y
                    ,Z: joints[j].localRotation.z
                };
                
                tempResultJointsArray.push(joint);
            }
            
            
//foldness finger block
            var tempResultFoldnessArray = [];
            for (var i = 0; i < ihand.fingerData.length; i++) {
                
                var majorJoint = {};
                majorJoint.originalJointIndex = i;
                majorJoint.foldedness = ihand.fingerData[i].foldedness;
                
                tempResultFoldnessArray.push(majorJoint);
            }

                         
//joint position block  ;  hand exist block            
            if (ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_LEFT){
                //left hand
                _leftHandJoints = tempResultJointsArray;
                rsd.HandModule.leftHandJointsFoldness = tempResultFoldnessArray;
                
                _isLeftExist = true;
                
                _leftHandId = ihand.uniqueId;
                
            } else if (ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_RIGHT){
                //right hand
                _rightHandJoints = tempResultJointsArray;  
                rsd.HandModule.rightHandJointsFoldness = tempResultFoldnessArray;
                
                _isRightExist = true;
            
                _rightHandId = ihand.uniqueId;
            }
        }
        
        
//hand gestures block
            for (var g = 0; g < handData.firedGestureData.length; g++) {
                
                var gestureData = handData.firedGestureData[g];
                
                if (gestureData.handId == _leftHandId){
                    AddGestureObjectToArray(gestureData, rsd.HandModule.leftHandGestures);
        
                } else if (gestureData.handId == _rightHandId){
                    AddGestureObjectToArray(gestureData, rsd.HandModule.rightHandGestures);

                }
            }
    
        rsd.HandModule.isRightExist = _isRightExist;
        rsd.HandModule.isLeftExist = _isLeftExist;
        rsd.HandModule.leftHandJoints = _leftHandJoints;
        rsd.HandModule.rightHandJoints = _rightHandJoints;
    };
    
  
    /* add one gesture data object to a selected array (that differentiates between left or right hand) */
    var AddGestureObjectToArray = function(dataObj, arr) {
        for (var i = 0; i<arr.length; i++) {
        
            if (dataObj.name == arr[i].name) {
                
                //update the gesture state
                arr[i].state = dataObj.state;
                
                //break the cycle
                return;
            }
        }
        
        //if reach here, means gesture doesnt exist in array, so add it
        arr.push(dataObj);
        
    };
    
     /**********************************************************************************************************/
    /*************************************BLOB RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
    
    
    var onBlobData = function (module, blobData) {
        
        rsd.BlobModule.isExist=false;
        if (blobData == null) return;
         
        //for blob exist block
        rsd.BlobModule.isExist = (blobData.numberOfBlobs > 0);
        
    };
    
    
     
     /**********************************************************************************************************/
    /*************************************END BLOB RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
     
     /**********************************************************************************************************/
    /*************************************VOICE  RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
    
    function OnSpeechRecognized(sender, recognizedSpeech) {
        
        if (speechModule == undefined || rsd.SpeechModule.isUpdatingGrammar == true) return;
        
        for (var sp=0; sp < recognizedSpeech.data.scores.length; sp++){
            var res = recognizedSpeech.data.scores[sp];
            
            if (res.confidence != undefined && res.confidence > rsd.SpeechModule.confidenceTolerance) {
                
                var recognizedWord = {
                    text            : res.sentence.toLowerCase()
                    , time          : +new Date()
                    , isIdentified  : false
                };
                
                rsd.SpeechModule.recognizedWords.push(recognizedWord);
                
                // make sure the unknown flag is off
                rsd.SpeechModule.isUserSaidUnknown = false;
                
                if (rsd.SpeechModule.addHighestResultOnly == true){
                    break;   
                }
            }
        }
    }

    /* alert fired every time user start saying something and finishes talking */
    function OnSpeechAlert(sender, speechAlert) {
        
        //make sure we dont use data while updating grammar
        if (speechModule == undefined || rsd.SpeechModule.isUpdatingGrammar == true) return;
        
        switch (speechAlert.data.label) {

            case intel.realsense.speech.AlertType.ALERT_SPEECH_BEGIN:
                rsd.SpeechModule.isUserSaidUnknown = false;
                rsd.SpeechModule.isUserSpoke = false;
                break;

            case intel.realsense.speech.AlertType.ALERT_SPEECH_UNRECOGNIZABLE:
                rsd.SpeechModule.isUserSaidUnknown = true;
                break;

            case intel.realsense.speech.AlertType.ALERT_SPEECH_END:
                rsd.SpeechModule.isUserSpoke = true;
                
                break;

            case intel.realsense.speech.AlertType.ALERT_SNR_LOW:
                // there is a big background noise
                
                break;
        }
    }
    
    
    function UpdateVoiceCommandGrammer(voiceCommand) {
        
        if (speechModule != undefined) {
            if (rsd.SpeechModule.isUpdatingGrammar == false) {
                //make sure we dont update grammar twice in parallel
                rsd.SpeechModule.isUpdatingGrammar = true;
                
                //stop speech module before changing grammer
                speechModule.stopRec()
                .then(function (result) {
                    rsd.SpeechModule.commands.push(voiceCommand);
                    return speechModule.buildGrammarFromStringList(1, rsd.SpeechModule.commands, null);                 
                })
                .then(function (result) {
                    return speechModule.setGrammar(1);

                })
                .then(function (result) {
                    return speechModule.startRec();
                
                })
                .then(function (result) {
                    console.log("new grammar list: "+rsd.SpeechModule.commands);
                    
                    return rsd.SpeechModule.isUpdatingGrammar = false;
                });
            }
        }
    }


         
     /**********************************************************************************************************/
    /*************************************END VOICE RECOGNITION*************************************************/
    /**********************************************************************************************************/
 

    
    
    /* Start RealSense- enable 4 modules: hands, face, blob & speech */
    var StartRealSense = function(useSpeech){
        var rs = intel.realsense;
                    
        rs.SenseManager.createInstance()
        .then(function (result) {
            sense = result;
            return result;
        })
        
        
/*        
         .then(function (result) {
             return rs.blob.BlobModule.activate(sense);
         })
         .then(function (result) {
             blobModule = result;
             return blobModule.createActiveConfiguration();
         })
         .then(function (result) {
             blobConfiguration = result;
             blobConfiguration.maxBlobs = rs.blob.MAX_NUMBER_OF_BLOBS; 
             return blobConfiguration.applyChanges();
         })
         .then(function (result) {
             blobModule.onFrameProcessed = onBlobData;
         })
*/
        
   
  
//face module         
        .then(function (result) {
            return rs.face.FaceModule.activate(sense); 
        })
        .then(function (result) {
            faceModule = result;
            return faceModule.createActiveConfiguration();
        })
        .then(function (result) {
            faceConfiguration = result;
            faceConfiguration.detection.isEnabled = true;
            faceConfiguration.detection.maxTrackedFaces = 1;
            faceConfiguration.trackingMode = intel.realsense.face.TrackingModeType.FACE_MODE_COLOR_PLUS_DEPTH;
            
            faceConfiguration.landmarks.isEnabled = true;
            faceConfiguration.landmarks.maxTrackedFaces = 1;
            faceConfiguration.pose.isEnabled = true;
            faceConfiguration.expressions.properties.isEnabled = true;

            return faceConfiguration.applyChanges();
        })
        
        //check if this works and fixes capabilities bug
        .then(function (result) {
            return faceConfiguration.release();
        })
        
        
        
//hand module        
        .then(function (result) {
            return rs.hand.HandModule.activate(sense);
        })
        .then(function (result) {
            handModule = result;
            return handModule.createActiveConfiguration();
        })
        .then(function (result) {
            handConfiguration = result;
            handConfiguration.allAlerts = false;
            handConfiguration.allGestures = true;
            return handConfiguration.applyChanges();
        })
        .then(function (result) {
            return handConfiguration.release();
        })
        
        
        
        
//speech module         
        .then(function (result) {
            if (useSpeech==false) return;
            
            return rs.speech.SpeechRecognition.createInstance(sense);
        })
        .then(function (result) {
            if (useSpeech==false) return;
            
            speechModule = result;
            return speechModule.buildGrammarFromStringList(1, rsd.SpeechModule.commands, null);              
        })
        .then(function (result) {
            if (useSpeech==false) return;
            
            return speechModule.setGrammar(1);
        })
        .then(function (result) {
            if (useSpeech==false) return;
            
            speechModule.onSpeechRecognized = OnSpeechRecognized;
            speechModule.onAlertFired = OnSpeechAlert;
            return speechModule.startRec();
        })
            
        
//general functionality        
        .then(function (result) {
            sense.onDeviceConnected = onConnect;
            sense.onStatusChanged = onStatus;
            
            faceModule.onFrameProcessed = onFaceHandData;
            handModule.onFrameProcessed = onFaceHandData;
            
            return sense.init();
        })
        
        //release function of the hand module configurations
        .then(function (result) {
            imageSize = sense.captureManager.queryImageSize(rs.StreamType.STREAM_TYPE_DEPTH);
            return sense.streamFrames();
        
        })
        .then(function (result) {
            console.log('Streaming ' + imageSize.width + 'x' + imageSize.height);
            
            
            //only now we are ready for real action
            rsd.Status = { 
                status: 2
                , msg: 'RealSense sensor is ready'
                , msgContent: ''
            };
            
        })
        .catch(function (error) {
            //var meth = error.request.method;
            //var sts = _.invert(intel.realsense.Status)[error.status];
            //console.log([[meth, sts].join(' '), error]);     
            console.warn('Init failed: ' + JSON.stringify(error));
            
            
            
            switch (error.status)
            {
                case intel.realsense.Status.STATUS_ALLOC_FAILED: 
                    // meaning -102
                    //sensor is already active on another window / app 
                    console.warn('Realsense Sensor is active in another window. please close the other one if you wish to work here');
                    rsd.Status = { 
                        status: 1
                        , msg : 'Sensor not ready' 
                        , msgContent : 'Intel® RealSense™ Sensor is already running in another window. <br>Please close all other browser windows and refresh the page.'
                    };
                    break;
                    
                    
                case intel.realsense.Status.STATUS_ITEM_UNAVAILABLE: 
                    // meaning -3
                    //unknown error
                    //happens mostly when the sensor is disconnected
                    //but also when DCM installation was removed 
                    rsd.Status = { 
                        status: 1
                        , msg : 'Sensor not ready'
                        , msgContent : 'If your sensor is disconnected, reconnect it and refresh the page. <br>Otherwise, please restart your PC.'
                    };
                    
                    //workaround - not supposed to be here
                    if (error.request.method =="PXCMSenseManager_Init"){
                        rsd.Status = { 
                            status: 0
                            , msg: 'Software not installed properly' 
                            , msgContent: 'Please upgrade Intel® RealSense™ F200 <a href="https://downloadcenter.intel.com/download/25044/Intel-RealSense-Depth-Camera-Manager-DCM-" target="_blank">Depth Camera Manager</a>.'
                        };
                    }
                    
                    //console.log("error.request.method "+error.request.method);
                    if (error.request.method == "PXCMSpeechRecognition_StartRec"){
                        //happens when no recording device is connected or enabled properly. speech module cannot work
                        rsd.Status = { 
                            status: 0
                            , msg: 'Recording device missing'
                            , msgContent: 'No recording device is detected or properly enabled. <br>Please fix issue and refresh the page.'
                        };
                        
                        /*
                        //clear senseManager and try init again without speech module
                        onClearSensor();
                        StartRealSense(false);
                        */
                        
                    }
                    break;
            
                default:
                    //if sensor not connected to usb - it gets here
                    //other option: sensor is already running somewhere else on the web
                    rsd.Status = { 
                        status: 1
                        , msg : 'Sensor not ready' 
                        , msgContent : 'Either your sensor is disconnected or there are other browser windows using it at the moment. <br>Please fix issue and refresh the page.'
                    };
                    break;
            }
            
            PopAlert();
        });
        
    };
    
    
    // check platform compatibility
    var ValidatePlatformState = function (){
        var rs = intel.realsense;
        console.log("ValidatePlatformState");
          
        if (rs != null && rs.SenseManager != null)
        {
       
            /*
            detectPlatform([module names in string], [supported sensors names in string])
            in order to support both F200 and SR300 sensor, we keep this empty array (meaning, support any connected sensor)
            */
            rs.SenseManager.detectPlatform(['face3d', 'hand', 'blob', 'voice', 'nuance_en_us_cnc'], [])
                
            .then(function (info) {
                
                //console.warn("Error detectPlatform: isCameraReady "+info.isCameraReady+ " isDCMUpdateNeeded:  "+info.isDCMUpdateNeeded+" isRuntimeInstalled: "+info.isRuntimeInstalled);
                
                if (info.nextStep == 'ready') {
                    
                    rsd.Status = { 
                        status: 1
                        , msg: 'Sensor is on, but extension not ready yet' 
                        , msgContent: 'extension is still loading'
                    };
                    //we are now able to start realsense sensor automatically!
                    StartRealSense(true);
                    
                } else if (info.nextStep == 'unsupported') {
                    //unsupported called when DCM not installed OR when browser is too old OR .......
                    rsd.Status = { 
                        status: 0
                        , msg: 'Sensor not supported or browser not supported' 
                        , msgContent: 'Intel® RealSense™ F200 Depth Camera Manager is not installed or browser not supported. <br>Download <a href="https://downloadcenter.intel.com/download/25044/Intel-RealSense-Depth-Camera-Manager-DCM-" target="_blank">lastest DCM version</a>. <br>Make sure we <a href="http://intel-realsense-extension-for-scratch.github.io/download.html" target="_blank">support</a> your browser.' 
                    };
                    
                } else if (info.nextStep == 'driver') {
                    //driver called when DCM is too old and should be upgraded
                    rsd.Status = { 
                        status: 0
                        , msg: 'Software not installed properly' 
                        , msgContent: 'Please upgrade Intel® RealSense™ F200 <a href="https://downloadcenter.intel.com/download/25044/Intel-RealSense-Depth-Camera-Manager-DCM-" target="_blank">Depth Camera Manager</a>.'
                    };
                
                } else if (info.nextStep == 'runtime') {
                    //runtime called when runtime needs to be installed
                    rsd.Status = { 
                        status: 0
                        , msg: 'Software not running properly'
                        , msgContent: 'Intel® RealSense™ SDK <a href="http://intel-realsense-extension-for-scratch.github.io/download.html" target="_blank">Web Runtime</a> is either missing or not properly installed. <br>Please restart PC after installation.'
                    };
                    
                }
                
                //pop alert 
                if (rsd.Status.status == 0) 
                {
                    PopAlert();
                }
                
            }).catch(function (error) {
                console.log('CheckPlatform failed: ' + JSON.stringify(error));
                
                rsd.Status = { 
                    status: 0
                    , msg: 'Unknown platform error'
                    , msgContent: 'We do not know this issue and would like to know more about it. <br>Please contact us for more details.'
                };
                
                PopAlert();
            });
            
        } else {
            rsd.Status = { 
                    status: 0
                    , msg: 'Unknown platform error'
                    , msgContent: 'We do not know this issue and would like to know more about it. <br>Please contact us for more details.'
                };
            
            PopAlert();
        }
        
        
    };
    
    var PopAlert = function() {
        
        if (rsd.Status.status < 2) {
            
            showModal("template-realsense", 
                    { 
                        title : rsd.Status.msg 
                        , message : rsd.Status.msgContent 
                    } );
        }
       
    };
    
    var dependencyAllCreated = function () {
    
        //console.log("check if all loaded");
        rs = intel.realsense;
        
        
        //create realsense data object
        rsd.FaceModule.init();
        rsd.HandModule.init();
        rsd.SpeechModule.init();
        
        
                
        //temporarily not validating and starting realsense (Erik requested this in order to check Localization check)
        
        //validate realsense platform state
        ValidatePlatformState(); 
        
        //or simply start realsense component right away without DetectPlatform()
        //StartRealSense(true);
        
        
    };
    
    
    
    
    console.log("Loading dependencies");
    
    $.getScript('https://www.promisejs.org/polyfills/promise-6.1.0.js')
    .done(function(script, textStatus) {
       
        $.getScript('https://autobahn.s3.amazonaws.com/autobahnjs/latest/autobahn.min.jgz')
        .done(function(script, textStatus) {

            //$.getScript('https://cdn.rawgit.com/intel-realsense-extension-for-scratch/resources/master/intel/realsense.js')
        // dev link: https://rawgit.com/shacharoz/
        // production link (cached): https://cdn.rawgit.com/shacharoz/

     $.getScript('https://rawgit.com/intel-realsense-extension-for-scratch/resources/master/intel/realsense.js')
            .done(function(script, textStatus) {
             
                dependencyAllCreated();
                  
            })
            .fail(function(jqxhr, settings, exception) {
                console.log('Load realsense fail');
            });
        })
        .fail(function(jqxhr, settings, exception) {
            console.log('Load autobahn fail');
        });
    })
    .fail(function(jqxhr, settings, exception) {
        console.log('Load promise fail');
    });

    

   
    
    var ValueMapper = function(value, source_min, source_max, dest_min, dest_max) {
       
        // Figure out range scales
        var sourceScale = source_max - source_min;
        var destScale = dest_max - dest_min;

        // Convert the source range into a 0-1 range (float)
        var normalizedSource = (value - source_min) / sourceScale;

        //Convert the 0-1 range into a value in the destination range.
        return dest_min + (normalizedSource * destScale);
       
   };
    
        
        
    /**********************************************************************************************************/
    /************************************END WEB API***********************************************************/
    /**********************************************************************************************************/
 
        
        
        
        
        
        
        
        
        
        
         
    
    
    
    // works in scratchX not in scratch. added an event to the window.beforeupload in order for this to really restart the sensor
    ext._shutdown = function () {
        console.warn("Scratch _shutdown called");
        onClearSensor();
    };


    ext._getStatus = function () {
        return rsd.Status;
    };
   
    
    // Scratch blocks events
    ext.isBlobExist = function () {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return false;
        
        return rsd.BlobModule.isExist;
    };
    
    
    ext.isHandExist = function (hand_side) {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return false;

        if (hand_side == 'Left Hand'){
            return rsd.HandModule.isLeftExist;
        
        }else if (hand_side == 'Right Hand'){
            return rsd.HandModule.isRightExist;
        
        } else {
            return (rsd.HandModule.isRightExist || rsd.HandModule.isLeftExist);
        
        }
        
        return false;
    };
    
    
    ext.getHandJointPosition = function (hand_position, hand_side, joint_name) {       
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return -1000;
        
        //if no rellevant hands exist, return false
        if (   (hand_side == 'Left Hand' && rsd.HandModule.isLeftExist == false)
            || (hand_side == 'Right Hand' && rsd.HandModule.isRightExist == false) 
            || (hand_side == 'Any Hand' && rsd.HandModule.isRightExist == false && rsd.HandModule.isLeftExist == false) ){
            //console.warn("exit 1");
            return -1000;   
        }
        
        
        //get array of requested hand
        var jointArray = [];
        
        if (hand_side == 'Any Hand'){
            if (rsd.HandModule.isLeftExist == true){
                hand_side = 'Left Hand';
            
            } else if (rsd.HandModule.isRightExist == true){
                hand_side = 'Right Hand';
            
            } else {
                //no hand available
                return -1000;
            }
        }
    
        jointArray = { 'Left Hand' : rsd.HandModule.leftHandJoints, 
                       'Right Hand': rsd.HandModule.rightHandJoints }[hand_side];
        
        //
        
        
        if (jointArray.length == 0){
            console.warn("exit 30");
            return -1000;
        }
        
        
        //get the requested joint index
        var requestedJointIndex = -1;
        
        if (joint_name !== parseInt(joint_name, 10)) {
        
            //joint_name is string variable from the menu
            for(var key in rsd.HandModule.jointDictionary){
                if (key == joint_name){
                    requestedJointIndex = rsd.HandModule.jointDictionary[key];
                    break; 
                }
            }
            
        } else {
            
            //joint_name is integer variable
            requestedJointIndex = joint_name;
        }
        
        if (requestedJointIndex < 0) {
            //couldnt find requested joint 
            return -1000;
            
        }
        
        //get requested joint data object
        var result = {};
        
        for (var i = 0; i < jointArray.length; i++) {
            if (jointArray[i].originalJointIndex === requestedJointIndex) {
                result = jointArray[i];
                break;
            }
        }

        
        
        //get the request value
        if (result.position != undefined) {
                   
            if (hand_position === "X Position") {
                return ValueMapper(result.position.X, RS_HAND_X_MAX_LEFT, RS_HAND_X_MAX_RIGHT, SCRATCH_X_MAX_LEFT, SCRATCH_X_MAX_RIGHT);
               
            } else {
                if (hand_position === "Y Position") {
                    return ValueMapper(result.position.Y, RS_HAND_Y_MAX_DOWN, RS_HAND_Y_MAX_UP, SCRATCH_Y_MAX_DOWN, SCRATCH_Y_MAX_UP);
                
                } else {
                   return result.position.Z;
                
                }
            }
        } else {
            //console.warn("exit 31");   
        }
        
        //console.warn("exit 3 "+requestedJointIndex+" "+ +result.position);
        return -1000;
    };
    

    
    ext.getHandGesture = function(hand_side, gesture_name) {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return false;

        var gesturesArray = [];
        
        //get array of requested hand
        if (hand_side == 'Any Hand'){
            gesturesArray = rsd.HandModule.rightHandGestures.concat(rsd.HandModule.leftHandGestures);
            
        } else {
            gesturesArray = { 'Left Hand'  : rsd.HandModule.leftHandGestures, 
                              'Right Hand' : rsd.HandModule.rightHandGestures}[hand_side];
        }
        
        
        //if no gestures, break now
        if (gesturesArray.length == 0) return false;
        
        //if no rellevant hands exist, return false
        if (   (hand_side == 'Left Hand' && rsd.HandModule.isLeftExist == false)
            || (hand_side == 'Right Hand' && rsd.HandModule.isRightExist == false) 
            || (hand_side == 'Any Hand' && rsd.HandModule.isRightExist == false && rsd.HandModule.isLeftExist == false) ){
            return false;   
        }
        
        
        
        //map display name to SDK's
        var requestedGestureSdkName = "";
        
        for (var key in rsd.HandModule.gestureDictionary){

            if (key == gesture_name){
                requestedGestureSdkName = rsd.HandModule.gestureDictionary[key];
                break;

            }
        }
            
        if (requestedGestureSdkName == "") {
            //couldnt find requested gesture
            return false;
        }
               
        for (var g = 0; g<gesturesArray.length; g++){
            if (gesturesArray[g].name == requestedGestureSdkName) {
                
                //return true if gesture started or in progress
                if (gesturesArray[g].state == intel.realsense.hand.GestureStateType.GESTURE_STATE_START)
                {
                    //we need to continue the cycle of testing since there is an option that we have 2 gestures with the same name in the AnyHand array
                    return true;   
                }
            }
        }
        
        //if reach here, no gesture occurs
        return false;
    }
    
    
    
    //foldedness values: closed 0 - spread 100
    ext.getHandJointFoldedness = function (hand_side, finger_name) {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return -1;

        var jointArray = [];
       
        if (hand_side == 'Any Hand'){
            if (rsd.HandModule.isLeftExist == true){
                hand_side='Left Hand';
            
            } else if (rsd.HandModule.isRightExist == true){
                hand_side='Right Hand';
            
            } else {
                //no hand available
                return -1;   
            
            }
        } 
        
        jointArray = {'Left Hand': rsd.HandModule.leftHandJointsFoldness, 
                      'Right Hand': rsd.HandModule.rightHandJointsFoldness}[hand_side];
          
        
        var requestedJointIndex = -1;
        for(var key in rsd.HandModule.majorJointDictionary){
               
            if (key == finger_name){
                requestedJointIndex = rsd.HandModule.majorJointDictionary[key];
                break;

            }
        }
            
        if (requestedJointIndex == -1) {
            //couldnt find requested joint 
            return -1;

        }
        
        for (var f=0; f<jointArray.length; f++){
            if (jointArray[f].originalJointIndex == requestedJointIndex){
                return jointArray[f].foldedness;
            }
        }
        
        return -1;
    };
    
    //hand rotation
    ext.getHandRotation = function(rotation_type, hand_side) {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return -1000;

        var jointArray = [];
        
        if (hand_side == 'Any Hand'){
            if (rsd.HandModule.isLeftExist == true){
                hand_side='Left Hand';
            
            } else if (rsd.HandModule.isRightExist == true){
                hand_side='Right Hand';
            
            } else {
                //no hand available
                return -1;   
            
            }
        } 
        
        jointArray = {  'Left Hand' : rsd.HandModule.leftHandJoints, 
                        'Right Hand': rsd.HandModule.rightHandJoints }[hand_side];
       
        
        
        var result = {};
        
        for (var i = 0; i < jointArray.length; i++) {
            if (jointArray[i].originalJointIndex == rsd.HandModule.jointDictionary.Wrist) {
                result = jointArray[i];
                break;
            }
        }
        
        
        
        if (result.rotation != undefined) {
            //return the right value
            if (rotation_type === 'Yaw') {
                return result.rotation.X;
               
            } else {
                if (rotation_type === 'Pitch') {
                    return result.rotation.Y;
                    
                } else {
                   return result.rotation.Z;
                
                }
            }
        }
        
        return -1000;
    };
    
    
    
    
    ext.isFaceExist = function () {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return false;

        return rsd.FaceModule.isExist;
    };
    
     
    ext.getFaceJointPosition = function (head_position, joint_name) {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return -1000;

        var result = {};
        
        var requestedJointIndex = -1;
        
        if (joint_name !== parseInt(joint_name, 10)) {
        
            //joint_name is string variable from the menu
            for(var key in rsd.FaceModule.landmarkDictionary){
               
                if (key == joint_name){
                    requestedJointIndex = rsd.FaceModule.landmarkDictionary[key];
                    break;
                    
                }
            }
            
        } else {
            
            //joint_name is integer variable
            requestedJointIndex = joint_name;
        }
        
        if (requestedJointIndex < 0) {
            //couldnt find requested joint 
            return -1000;
        }
        
        for (var i = 0; i < rsd.FaceModule.joints.length; i++) {
            if (rsd.FaceModule.joints[i].originalJointIndex === requestedJointIndex) {
                result = rsd.FaceModule.joints[i];
                break;
            }
        }
        
        if (result == {}) {
            //couldnt find requested joint 
            return -1000;
        }
        
        
        
        //return the right value
        if (head_position === "X Position") {
            return ValueMapper(result.position.X, RS_FACE_X_MAX_LEFT, RS_FACE_X_MAX_RIGHT, SCRATCH_X_MAX_LEFT, SCRATCH_X_MAX_RIGHT);
        
        } else {
            if (head_position === "Y Position") {
                return ValueMapper(result.position.Y, RS_FACE_Y_MAX_DOWN, RS_FACE_Y_MAX_UP, SCRATCH_Y_MAX_DOWN, SCRATCH_Y_MAX_UP);
           
            } else {
                return result.position.Z;
        
            }
        }
        
        return -1000;
    };
    
    
    ext.isFacialExpressionOccured = function (facial_expression) {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return false;

        var requestedExpressionIndex = -1;
        
        for (var key in rsd.FaceModule.expressionsDictionary){

            if (key == facial_expression){
                requestedExpressionIndex = rsd.FaceModule.expressionsDictionary[key];
                break;

            }
        }
        
        if (requestedExpressionIndex == -1) {
            //couldnt find requested expression
            return false;

        }
        
        for (var fe = 0; fe < rsd.FaceModule.expressionsOccuredLastFrame.length; fe++){
            
            if (rsd.FaceModule.expressionsOccuredLastFrame[fe] == requestedExpressionIndex){                
                return true;
                break;
            }
        }
        return false;
        
    };
    
    
    
    
    ext.getHeadRotation = function(rotation_type) {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return 0;

        if (rotation_type === "Yaw"){
            return ValueMapper(rsd.FaceModule.headRotation.Yaw, RS_FACE_ROTATION_MIN, RS_FACE_ROTATION_MAX, 0, 180);
           
        } else {
            if (rotation_type === "Pitch"){
                return ValueMapper(rsd.FaceModule.headRotation.Pitch, RS_FACE_ROTATION_MIN, RS_FACE_ROTATION_MAX, 0, 180);
           
            } else {
                return ValueMapper(rsd.FaceModule.headRotation.Roll, RS_FACE_ROTATION_MIN, RS_FACE_ROTATION_MAX, 0, 180);
            
            }
        }
        return 0;    
    };
    
    
    
    
    
    
    function IsWordSimilar(timenow, speechWord, wordSaid) {
        //if reached time stamp difference larger than wished for, break and exit search
        if (timenow - speechWord.time > rsd.SpeechModule.tolerance * 1000){
            return false;
        }

        if (speechWord.text == wordSaid) {
            
            //console.warn("speechWord.isIdentified: "+speechWord.isIdentified);
            
            //this would allow a one time identification only
            if (speechWord.isIdentified == false){
                
                speechWord.isIdentified = true;
                return true;
            }
        }
        
        return false;
    };
    
    
    ext.getRecognizedSpeech = function() {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return "";

        var numberOfWords = rsd.SpeechModule.recognizedWords.length;
        
        if (numberOfWords == 0) return "";
        
        /*
        //if word has been said too long ago, dont count it
        var now = new Date();
        if (now.time - rsd.SpeechModule.recognizedWords[numberOfWords-1].time > rsd.SpeechModule.tolerance) return "";
        */
        
        return rsd.SpeechModule.recognizedWords[numberOfWords-1].text;
    };

    
    ext.hasUserSaid = function (word) {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return false;

        //make sure word is lowercased
        word = word.toLowerCase();
        
        //make sure this word exists in the voice commands array
        if (rsd.SpeechModule.commands.indexOf(word) <= -1) {
            UpdateVoiceCommandGrammer(word);
            return false;
        }
        
        
        
        
        //make sure we have anything detected
        var numberOfWords = rsd.SpeechModule.recognizedWords.length;
        
        if (numberOfWords == 0) return false;
        
        var now = +new Date();
        
        var speechItem = rsd.SpeechModule.recognizedWords[numberOfWords-1];
        
        return IsWordSimilar(now, speechItem, word);
        
        /*
        //going backwards from last recognized word to search for the wanted one
        for (var i = numberOfWords-1; i>=0; i--){
            var speechItemArr = rsd.SpeechModule.recognizedWords[i];
            
            if (IsWordSimilar(now, speechItemArr, word) == true){
                return true;
                break;
            }
        }
        
        return false;
        */
    };
    
    
    ext.hasUserSaidAnything = function() {
        //make sure the extension is ready for use
        if (rsd.Status.status < 2) return false;

        if (rsd.SpeechModule.isUserSpoke == true) {
            
            //make sure to zero the variable after you return true
            rsd.SpeechModule.isUserSpoke = false;
            return true;
        }
        
        //return false
        return rsd.SpeechModule.isUserSpoke;
        
    };
    
    
    
    
    var descriptor = {
        blocks: [
             ['b', 'face visible?', 'isFaceExist', '']
            ,['r', '%m.position_value of %d.face_joints', 'getFaceJointPosition', 'X Position', 'Nose']
            ,['b', 'face expression %m.facial_expressions?', 'isFacialExpressionOccured', 'Wink left']
            ,['r', '%m.rotation_value rotation of Head', 'getHeadRotation', 'Yaw']
            
        ,['-']
            ,['b', '%m.hand_type visible?', 'isHandExist', 'Any Hand']
            ,['r', '%m.position_value of %m.hand_type %d.hand_joints', 'getHandJointPosition', 'X Position', 'Any Hand', 'Index tip']
            ,['b', '%m.hand_type gesture %m.hand_gestures?', 'getHandGesture', 'Any Hand', 'V sign']
            ,['r', '%m.hand_type %m.major_joint_name foldedness amount', 'getHandJointFoldedness', 'Any Hand', 'Index']
           // ,['r', '%m.rotation_value of %m.hand_type', 'getHandRotation', 'Rotation X', 'Any Hand']
            
        ,['-']
            ,['b', 'user said %s?', 'hasUserSaid', 'Hello']
            ,['b', 'user said anything?', 'hasUserSaidAnything']
            ,['r', 'last word user said', 'getRecognizedSpeech']
            
        ]
         
        , menus: {
            "hand_type":            [ "Left Hand", "Right Hand", "Any Hand" ],
            "face_joints":          [ "Left eye", "Right eye", "Left eye brow", "Right eye brow", 
                                    "Upper lip", "Bottom lip", "Nose", "Chin" ],
            "hand_joints":          [ "Index tip", "Index base", "Index jointC", "Index jointB",
                                    "Thumb tip", "Thumb base", "Thumb jointC", "Thumb jointB",
                                    "Middle tip", "Middle base", "Middle jointC", "Middle jointB",
                                    "Ring tip", "Ring base", "Ring jointC", "Ring jointB",
                                    "Pinky tip", "Pinky base", "Pinky jointC", "Pinky jointB",
                                    "Wrist", "Center" ],
            "major_joint_name":     [ "Index", "Thumb", "Middle", "Ring", "Pinky" ],
            "facial_expressions":   [ "Wink left", "Wink right" ,"Brow lifted left", 
                                     "Brow lifted right", "Brow lowered left", 
                                     "Brow lowered right", "Mouth open", 
                                     "Tongue out", "Smile", "Kiss"],
            "hand_gestures":        [ "Spread fingers", "V sign", "Full pinch",
                                    "Two fingers pinch open", "Swipe down", "Swipe up", 
                                    "Swipe left", "Swipe right", "Tap", "Fist", "Thumb up", 
                                    "Thumb down", "Wave" ],
            "rotation_value":       [ "Yaw", "Pitch", "Roll" ],
            "position_value":       [ "X Position",  "Y Position",  "Z Position" ],
        }
        
        , url:                      'http://www.intel.com/realsense/scratch'
    };
    
    ScratchExtensions.register('Intel RealSense', descriptor, ext);
    
})
({});
