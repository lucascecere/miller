import Image from 'next/image'

const photos = [
  {
    src: '/nh-wildcat-mountain.jpg',
    alt: 'Wildcat Mountain 4,062ft, White Mountains NH',
  },
  {
    src: '/nh-lake-winnipesaukee.jpg',
    alt: 'Summit view over Lake Winnipesaukee, New Hampshire',
  },
  {
    src: '/nh-mountain-valley.jpg',
    alt: 'New Hampshire mountain valley vista',
  },
]

export function PhotoStrip() {
  return (
    <section aria-label="New Hampshire" className="py-4 px-4 lg:px-6" style={{ backgroundColor: '#FAFAF7' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-2 lg:gap-3">
          {photos.map((photo) => (
            <div
              key={photo.src}
              className="relative w-full overflow-hidden rounded-sm"
              style={{ aspectRatio: '16/9' }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 33vw, (max-width: 1280px) 33vw, 400px"
              />
            </div>
          ))}
        </div>
        <p className="text-xs mt-2 text-right" style={{ color: '#9C7B3F' }}>
          New Hampshire — where we live and work
        </p>
      </div>
    </section>
  )
}
