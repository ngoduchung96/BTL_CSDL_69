const MODEL_URL = '/models'
const imageUpload = document.getElementById('imageUpload')

Promise.all([
     faceapi.loadSsdMobilenetv1Model(MODEL_URL),
    faceapi.loadFaceLandmarkModel(MODEL_URL),
    faceapi.loadFaceRecognitionModel(MODEL_URL)
]).then(start)
const loadLibrary = async () => {
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
}

async function start() {
    const container = document.createElement('div') // tạo 1 thẻ div trống 
    container.style.position = 'relative'
    document.body.append(container) // đặt thẻ container ngay dưới thẻ input và trên dòng loaded
    const labeledFaceDescriptors = await loadLabelImage()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    document.body.append('loaded')
    imageUpload.addEventListener('change',async () => {
        const image = await faceapi.bufferToImage(imageUpload.files[0]) // chuyển từ dang buffer về dạng hình ảnh
        container.append(image)// hiển thị ảnh trên màn hình
        const canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)
        const displaySize = {width:image.width, height:image.height}
        // faceapi.matchDimensions(canvas, displaySize) // cho tranh sơn dầu có cùng kích thước với ảnh để detect
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptor() // phát hiện tất cả các khuôn mặt trong tấm ảnh
        console.log('detections.length',detections.length) // log số khuôn mặt trong hình
        const resizeDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizeDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        results.forEach((result,index) => {
            const box = resizeDetections[index].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, {label: result.toString()})
            drawBox.draw(canvas)
        }) 
    })
}

function loadLabelImage() {
    const labels = ['hung']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for(let i = 1;i<=2;i++) {
                const img = await faceapi.fetchImage(`https://github.com/ngoduchung96/BTL_CSDL_69/tree/master/images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptors()
                descriptions.push(detections.descriptor)
            }
            return new faceapi.labeledFaceDescriptors(label, descriptions)
        })
    )
}
