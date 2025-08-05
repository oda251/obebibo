class Api::Admin::EntriesController < Api::ApplicationController
  before_action :authenticate_admin!
  before_action :set_entry, only: [:show, :update]

  def index
    @entries = Entry.includes(:user, :campaign).recent.page(params[:page]).per(params[:per_page] || 20)
    @entries = @entries.where(status: params[:status]) if params[:status].present?
    
    render json: {
      entries: @entries.map { |e| entry_json(e) },
      total: @entries.total_count,
      page: @entries.current_page,
      per_page: @entries.limit_value
    }
  end

  def show
    render json: { entry: entry_detail_json(@entry) }
  end

  def update
    if @entry.update(entry_params)
      render_success({ entry: entry_json(@entry) }, '応募状況が更新されました')
    else
      render_error(@entry.errors.full_messages.join(', '))
    end
  end

  private

  def set_entry
    @entry = Entry.find(params[:id])
  end

  def entry_params
    params.require(:entry).permit(:status)
  end

  def entry_json(entry)
    {
      id: entry.id,
      status: entry.status,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      user: {
        id: entry.user.id,
        email: entry.user.email
      },
      campaign: {
        id: entry.campaign.id,
        title: entry.campaign.title
      }
    }
  end

  def entry_detail_json(entry)
    entry_json(entry).merge(
      campaign: {
        id: entry.campaign.id,
        title: entry.campaign.title,
        description: entry.campaign.description,
        company: {
          name: entry.campaign.company.name
        }
      },
      shipment: entry.shipment ? {
        id: entry.shipment.id,
        status: entry.shipment.status,
        shipped_at: entry.shipment.shipped_at
      } : nil
    )
  end

  def authenticate_admin!
    render_error('管理者権限が必要です', :unauthorized) unless admin_signed_in?
  end
end