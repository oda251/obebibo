class Admin::EntriesController < Admin::ApplicationController
  before_action :set_entry, only: [:show, :update]

  def index
    @entries = Entry.includes(:user, :campaign).recent.page(params[:page]).per(20)
    @entries = @entries.where(status: params[:status]) if params[:status].present?
  end

  def show
  end

  def update
    if @entry.update(entry_params)
      redirect_to admin_entry_path(@entry), notice: '応募状況が更新されました'
    else
      render :show
    end
  end

  private

  def set_entry
    @entry = Entry.find(params[:id])
  end

  def entry_params
    if params[:entry].present?
      params.require(:entry).permit(:status)
    else
      params.permit(:status)
    end
  end
end