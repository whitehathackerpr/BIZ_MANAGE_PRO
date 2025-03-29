from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Chat, ChatMessage, ChatParticipant, User
from ..extensions import db
from ..utils.decorators import admin_required
from ..utils.notifications import create_notification

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chats', methods=['GET'])
@jwt_required()
def get_chats():
    current_user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Get chats where user is a participant
    chats = Chat.query.join(
        ChatParticipant
    ).filter(
        ChatParticipant.user_id == current_user_id
    ).order_by(
        Chat.updated_at.desc()
    ).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'chats': [chat.to_dict() for chat in chats.items],
        'total': chats.total,
        'pages': chats.pages,
        'current_page': chats.page
    })

@chat_bp.route('/api/chats', methods=['POST'])
@jwt_required()
def create_chat():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if not data.get('participants'):
        return jsonify({
            'error': 'At least one participant is required'
        }), 400
    
    # Create chat
    chat = Chat(
        name=data.get('name', 'New Chat'),
        type=data.get('type', 'private'),
        created_by=current_user_id
    )
    db.session.add(chat)
    
    # Add participants
    participants = set(data['participants'] + [current_user_id])
    for user_id in participants:
        participant = ChatParticipant(
            chat=chat,
            user_id=user_id,
            role='admin' if user_id == current_user_id else 'member'
        )
        db.session.add(participant)
        
        # Create notification for new participants
        if user_id != current_user_id:
            create_notification(
                user_id=user_id,
                title='New Chat',
                message=f'You have been added to a new chat: {chat.name}',
                type='chat'
            )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Chat created successfully',
        'chat': chat.to_dict()
    }), 201

@chat_bp.route('/api/chats/<int:id>', methods=['GET'])
@jwt_required()
def get_chat(id):
    current_user_id = get_jwt_identity()
    
    # Check if user is a participant
    chat = Chat.query.join(
        ChatParticipant
    ).filter(
        Chat.id == id,
        ChatParticipant.user_id == current_user_id
    ).first_or_404()
    
    return jsonify(chat.to_dict())

@chat_bp.route('/api/chats/<int:id>', methods=['PUT'])
@jwt_required()
def update_chat(id):
    current_user_id = get_jwt_identity()
    
    # Check if user is a participant and has admin role
    chat = Chat.query.join(
        ChatParticipant
    ).filter(
        Chat.id == id,
        ChatParticipant.user_id == current_user_id,
        ChatParticipant.role == 'admin'
    ).first_or_404()
    
    data = request.get_json()
    
    # Update chat fields
    if 'name' in data:
        chat.name = data['name']
    if 'type' in data:
        chat.type = data['type']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Chat updated successfully',
        'chat': chat.to_dict()
    })

@chat_bp.route('/api/chats/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_chat(id):
    current_user_id = get_jwt_identity()
    
    # Check if user is a participant and has admin role
    chat = Chat.query.join(
        ChatParticipant
    ).filter(
        Chat.id == id,
        ChatParticipant.user_id == current_user_id,
        ChatParticipant.role == 'admin'
    ).first_or_404()
    
    db.session.delete(chat)
    db.session.commit()
    
    return jsonify({
        'message': 'Chat deleted successfully'
    })

@chat_bp.route('/api/chats/<int:id>/messages', methods=['GET'])
@jwt_required()
def get_chat_messages(id):
    current_user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    # Check if user is a participant
    chat = Chat.query.join(
        ChatParticipant
    ).filter(
        Chat.id == id,
        ChatParticipant.user_id == current_user_id
    ).first_or_404()
    
    messages = ChatMessage.query.filter_by(
        chat_id=id
    ).order_by(
        ChatMessage.created_at.desc()
    ).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'messages': [message.to_dict() for message in messages.items],
        'total': messages.total,
        'pages': messages.pages,
        'current_page': messages.page
    })

@chat_bp.route('/api/chats/<int:id>/participants', methods=['GET'])
@jwt_required()
def get_chat_participants(id):
    current_user_id = get_jwt_identity()
    
    # Check if user is a participant
    chat = Chat.query.join(
        ChatParticipant
    ).filter(
        Chat.id == id,
        ChatParticipant.user_id == current_user_id
    ).first_or_404()
    
    participants = ChatParticipant.query.filter_by(
        chat_id=id
    ).all()
    
    return jsonify({
        'participants': [participant.to_dict() for participant in participants]
    })

@chat_bp.route('/api/chats/<int:id>/participants', methods=['POST'])
@jwt_required()
def add_chat_participants(id):
    current_user_id = get_jwt_identity()
    
    # Check if user is a participant and has admin role
    chat = Chat.query.join(
        ChatParticipant
    ).filter(
        Chat.id == id,
        ChatParticipant.user_id == current_user_id,
        ChatParticipant.role == 'admin'
    ).first_or_404()
    
    data = request.get_json()
    new_participants = data.get('participants', [])
    
    if not new_participants:
        return jsonify({
            'error': 'No participants provided'
        }), 400
    
    # Add new participants
    for user_id in new_participants:
        if not ChatParticipant.query.filter_by(
            chat_id=id, user_id=user_id
        ).first():
            participant = ChatParticipant(
                chat_id=id,
                user_id=user_id,
                role='member'
            )
            db.session.add(participant)
            
            # Create notification for new participant
            create_notification(
                user_id=user_id,
                title='Added to Chat',
                message=f'You have been added to chat: {chat.name}',
                type='chat'
            )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Participants added successfully'
    })

@chat_bp.route('/api/chats/<int:id>/participants/<int:user_id>', methods=['DELETE'])
@jwt_required()
def remove_chat_participant(id, user_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is a participant and has admin role
    chat = Chat.query.join(
        ChatParticipant
    ).filter(
        Chat.id == id,
        ChatParticipant.user_id == current_user_id,
        ChatParticipant.role == 'admin'
    ).first_or_404()
    
    # Prevent removing the last admin
    if user_id == current_user_id:
        return jsonify({
            'error': 'Cannot remove yourself from the chat'
        }), 400
    
    participant = ChatParticipant.query.filter_by(
        chat_id=id, user_id=user_id
    ).first_or_404()
    
    db.session.delete(participant)
    db.session.commit()
    
    return jsonify({
        'message': 'Participant removed successfully'
    })

@chat_bp.route('/api/chats/<int:id>/participants/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def update_participant_role(id, user_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is a participant and has admin role
    chat = Chat.query.join(
        ChatParticipant
    ).filter(
        Chat.id == id,
        ChatParticipant.user_id == current_user_id,
        ChatParticipant.role == 'admin'
    ).first_or_404()
    
    data = request.get_json()
    new_role = data.get('role')
    
    if not new_role or new_role not in ['admin', 'member']:
        return jsonify({
            'error': 'Invalid role'
        }), 400
    
    participant = ChatParticipant.query.filter_by(
        chat_id=id, user_id=user_id
    ).first_or_404()
    
    participant.role = new_role
    db.session.commit()
    
    return jsonify({
        'message': 'Participant role updated successfully',
        'participant': participant.to_dict()
    }) 