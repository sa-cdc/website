class Thumbnailize < Nanoc::Filter

  identifier :thumbnailize
  type       :binary

  def run(filename, params={})

    if(os() == :macosx)
      system(
        'sips',
        '--resampleWidth',
        params[:width].to_s,
        '--out',
        output_filename,
      filename
      )
    else
        cmd = "convert -flatten -thumbnail #{params[:width].to_s} #{filename}[0] png:#{output_filename}"
        out = `#{cmd}`
    end
  end


end